import assert from 'node:assert/strict'
import test from 'node:test'

import {
  cancelMembershipOrder,
  createMembershipOrder,
  confirmMembershipPayment,
  formatMembershipState,
  getMembershipOrderStatus,
  listMembershipOrdersForStudent,
} from './membership.ts'
import { createSessionToken } from './session.ts'
import { createMemoryRepository } from './testing/memoryRepository.ts'

const secret = 'test-secret'

function tokenFor(studentId: string, openId = 'openid_001') {
  return createSessionToken({
    expiresInSeconds: 60 * 60,
    now: new Date('2026-08-26T10:00:00.000Z'),
    openId,
    secret,
    studentId,
  })
}

test('creates a pending order using the active growth plan amount', async () => {
  const repository = createMemoryRepository()

  const result = await createMembershipOrder({
    input: {
      growthPlanId: 'growth_plan_001',
      sessionToken: tokenFor('student_001'),
    },
    now: new Date('2026-08-26T10:02:00.000Z'),
    paymentGateway: {
      createPaymentParams: async ({ amountCents, orderNo }) => ({
        mock: true,
        nonceStr: 'nonce_001',
        orderNo,
        packageValue: `prepay_id=${orderNo}`,
        paySign: 'pay-sign',
        signType: 'RSA',
        timeStamp: '1787748120',
        totalFee: amountCents,
      }),
    },
    randomSuffix: () => 'ABC123',
    repository,
    secret,
  })

  assert.equal(result.order.amountCents, 500)
  assert.equal(result.order.status, 'pending')
  assert.equal(result.paymentParams.orderNo, 'UL20260826100200ABC123')
})

test('activates membership once for repeated callbacks from the same transaction', async () => {
  const repository = createMemoryRepository()

  const first = await confirmMembershipPayment({
    input: {
      eventKey: 'wx_event_001',
      orderNo: 'order_paid_once',
      paidAt: '2026-08-26T10:03:00.000Z',
      transactionId: 'wx_tx_001',
    },
    now: new Date('2026-08-26T10:03:00.000Z'),
    repository,
  })

  const second = await confirmMembershipPayment({
    input: {
      eventKey: 'wx_event_001',
      orderNo: 'order_paid_once',
      paidAt: '2026-08-26T10:03:00.000Z',
      transactionId: 'wx_tx_001',
    },
    now: new Date('2026-08-26T10:04:00.000Z'),
    repository,
  })

  assert.equal(first.membership.expiresAt, '2027-02-25T10:03:00.000Z')
  assert.equal(second.membership.expiresAt, '2027-02-25T10:03:00.000Z')
  assert.equal(repository.paymentEvents.size, 1)
  assert.equal(repository.memberships.size, 1)
})

test('formats active and expired membership state for Mini Program display', () => {
  const active = formatMembershipState({
    membership: {
      expiresAt: '2027-02-25T10:03:00.000Z',
      growthPlanId: 'growth_plan_001',
      id: 'membership_001',
      sourceOrderNo: 'order_paid_once',
      startedAt: '2026-08-26T10:03:00.000Z',
      status: 'active',
      studentId: 'student_001',
    },
    now: new Date('2026-08-27T10:00:00.000Z'),
  })
  const expired = formatMembershipState({
    membership: {
      expiresAt: '2026-08-25T10:03:00.000Z',
      growthPlanId: 'growth_plan_001',
      id: 'membership_002',
      sourceOrderNo: 'order_expired_once',
      startedAt: '2026-02-23T10:03:00.000Z',
      status: 'active',
      studentId: 'student_001',
    },
    now: new Date('2026-08-27T10:00:00.000Z'),
  })

  assert.deepEqual(active, {
    expiresAt: '2027-02-25T10:03:00.000Z',
    expiresText: '有效期至 2027-02-25',
    isActive: true,
    statusText: '生效中',
  })
  assert.deepEqual(expired, {
    expiresAt: '2026-08-25T10:03:00.000Z',
    expiresText: '已于 2026-08-25 到期',
    isActive: false,
    statusText: '已过期',
  })
})

test('returns order status only for the student who owns the order', async () => {
  const repository = createMemoryRepository()
  const ownerResult = await getMembershipOrderStatus({
    input: {
      orderNo: 'order_paid_once',
      sessionToken: tokenFor('student_001'),
    },
    now: new Date('2026-08-26T10:05:00.000Z'),
    repository,
    secret,
  })

  assert.equal(ownerResult.order.orderNo, 'order_paid_once')

  await assert.rejects(
    () =>
      getMembershipOrderStatus({
        input: {
          orderNo: 'order_paid_once',
          sessionToken: tokenFor('student_other_class', 'openid_other_class'),
        },
        now: new Date('2026-08-26T10:05:00.000Z'),
        repository,
        secret,
      }),
    /订单不存在/,
  )
})

test('lists only membership orders for the current student', async () => {
  const repository = createMemoryRepository()
  await repository.createOrder({
    amountCents: 500,
    createdAt: '2026-08-26T10:06:00.000Z',
    growthPlanId: 'growth_plan_001',
    orderNo: 'order_student_own_new',
    paidAt: '2026-08-26T10:07:00.000Z',
    status: 'paid',
    studentId: 'student_001',
  })
  await repository.createOrder({
    amountCents: 500,
    createdAt: '2026-08-26T10:08:00.000Z',
    growthPlanId: 'growth_plan_001',
    orderNo: 'order_other_student',
    status: 'paid',
    studentId: 'student_other_class',
  })

  const result = await listMembershipOrdersForStudent({
    input: { sessionToken: tokenFor('student_001') },
    now: new Date('2026-08-26T10:10:00.000Z'),
    repository,
    secret,
  })

  assert.deepEqual(
    result.orders.map((order) => order.orderNo),
    ['order_student_own_new', 'order_paid_once'],
  )
  assert.deepEqual(result.orders[0], {
    amountCents: 500,
    amountText: '¥5.00',
    createdAt: '2026-08-26T10:06:00.000Z',
    orderNo: 'order_student_own_new',
    paidAt: '2026-08-26T10:07:00.000Z',
    status: 'paid',
    statusText: '已支付',
  })
})

test('cancels a pending membership order owned by the current student', async () => {
  const repository = createMemoryRepository()

  const result = await cancelMembershipOrder({
    input: {
      orderNo: 'order_paid_once',
      sessionToken: tokenFor('student_001'),
    },
    now: new Date('2026-08-26T10:12:00.000Z'),
    repository,
    secret,
  })

  assert.equal(result.order.status, 'cancelled')
  assert.equal(result.order.statusText, '已取消')
  assert.equal(repository.orders.get('order_paid_once')?.status, 'cancelled')
})

test('rejects cancellation after a membership order has been paid', async () => {
  const repository = createMemoryRepository()
  await repository.updateOrder('order_001', {
    paidAt: '2026-08-26T10:07:00.000Z',
    status: 'paid',
  })

  await assert.rejects(
    () =>
      cancelMembershipOrder({
        input: {
          orderNo: 'order_paid_once',
          sessionToken: tokenFor('student_001'),
        },
        now: new Date('2026-08-26T10:12:00.000Z'),
        repository,
        secret,
      }),
    /已支付订单不能取消/,
  )

  assert.equal(repository.orders.get('order_paid_once')?.status, 'paid')
})
