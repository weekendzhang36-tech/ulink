import { MiniProgramError } from './errors.ts'
import { verifySessionToken } from './session.ts'
import type { MembershipRecord, MiniProgramRepository, PaymentGateway } from './types.ts'

function formatOrderNo(now: Date, suffix: string) {
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const mm = String(now.getUTCMinutes()).padStart(2, '0')
  const ss = String(now.getUTCSeconds()).padStart(2, '0')

  return `UL${y}${m}${d}${hh}${mm}${ss}${suffix}`
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)

  return next
}

function dateText(value: string) {
  return value.slice(0, 10)
}

export function formatMembershipState({
  membership,
  now,
}: {
  membership?: MembershipRecord
  now: Date
}) {
  if (!membership) {
    return {
      expiresAt: null,
      expiresText: '加入后可查看有效期',
      isActive: false,
      statusText: '未开通',
    }
  }

  const expiresAt = Date.parse(membership.expiresAt)
  const isActive =
    membership.status === 'active' && Number.isFinite(expiresAt) && expiresAt > now.getTime()
  const expiresDate = dateText(membership.expiresAt)

  return {
    expiresAt: membership.expiresAt,
    expiresText: isActive ? `有效期至 ${expiresDate}` : `已于 ${expiresDate} 到期`,
    isActive,
    statusText: isActive ? '生效中' : '已过期',
  }
}

export async function createMembershipOrder({
  input,
  now,
  paymentGateway,
  randomSuffix,
  repository,
  secret,
}: {
  input: {
    growthPlanId: string
    sessionToken: string
  }
  now: Date
  paymentGateway: PaymentGateway
  randomSuffix: () => string
  repository: MiniProgramRepository
  secret: string
}) {
  const session = verifySessionToken({ now, secret, token: input.sessionToken })
  const student = session.studentId
    ? await repository.findStudentById(session.studentId)
    : await repository.findStudentByOpenId(session.openId)
  if (!student) {
    throw new MiniProgramError('请先完成学生资料')
  }

  const growthPlan = await repository.findActiveGrowthPlanById(input.growthPlanId)
  if (!growthPlan || !growthPlan.isActive) {
    throw new MiniProgramError('成长计划暂不可用')
  }

  const orderNo = formatOrderNo(now, randomSuffix())
  const order = await repository.createOrder({
    amountCents: growthPlan.priceCents,
    createdAt: now.toISOString(),
    growthPlanId: growthPlan.id,
    orderNo,
    status: 'pending',
    studentId: student.id,
  })
  const paymentParams = await paymentGateway.createPaymentParams({
    amountCents: order.amountCents,
    body: growthPlan.title,
    orderNo,
    student,
  })

  return { order, paymentParams }
}

export async function confirmMembershipPayment({
  input,
  now,
  repository,
}: {
  input: {
    eventKey: string
    orderNo: string
    paidAt: string
    transactionId?: string
  }
  now: Date
  repository: MiniProgramRepository
}) {
  const existingEvent = await repository.findPaymentEventByKey(input.eventKey)
  if (existingEvent) {
    const order = await repository.findOrderByOrderNo(existingEvent.orderNo)
    if (!order) {
      throw new MiniProgramError('支付事件对应订单不存在', 409)
    }
    const membership = await repository.findMembershipByStudentId(order.studentId)
    if (!membership) {
      throw new MiniProgramError('支付事件已存在但会员记录缺失', 409)
    }

    return { membership, order, paymentEvent: existingEvent }
  }

  const order = await repository.findOrderByOrderNo(input.orderNo)
  if (!order) {
    throw new MiniProgramError('订单不存在', 404)
  }
  if (order.status !== 'pending' && order.status !== 'paid') {
    throw new MiniProgramError('订单状态不可支付', 409)
  }

  const paymentEvent = await repository.createPaymentEvent({
    eventKey: input.eventKey,
    orderNo: input.orderNo,
    processedAt: now.toISOString(),
    status: 'paid',
    transactionId: input.transactionId,
  })
  const paidOrder =
    order.status === 'paid'
      ? order
      : await repository.updateOrder(order.id, {
          paidAt: input.paidAt,
          status: 'paid',
          wechatTransactionId: input.transactionId,
        })
  const growthPlan = await repository.findActiveGrowthPlanById(paidOrder.growthPlanId)
  if (!growthPlan) {
    throw new MiniProgramError('成长计划不存在', 409)
  }

  const existingMembership = await repository.findMembershipByStudentId(paidOrder.studentId)
  const baseStart = new Date(input.paidAt)
  const currentExpiry = existingMembership ? new Date(existingMembership.expiresAt) : undefined
  const startsAt = currentExpiry && currentExpiry > baseStart ? currentExpiry : baseStart
  const expiresAt = addDays(startsAt, growthPlan.durationDays).toISOString()
  const membership = existingMembership
    ? await repository.updateMembership(existingMembership.id, {
        expiresAt,
        growthPlanId: growthPlan.id,
        sourceOrderNo: paidOrder.orderNo,
        status: 'active',
      })
    : await repository.createMembership({
        expiresAt,
        growthPlanId: growthPlan.id,
        sourceOrderNo: paidOrder.orderNo,
        startedAt: baseStart.toISOString(),
        status: 'active',
        studentId: paidOrder.studentId,
      })

  return { membership, order: paidOrder, paymentEvent }
}
