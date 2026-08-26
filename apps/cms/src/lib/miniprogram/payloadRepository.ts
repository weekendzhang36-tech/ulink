import { MiniProgramError } from './errors.ts'
import type {
  GrowthPlanRecord,
  InstructorStudentSummary,
  MembershipRecord,
  MiniProgramRepository,
  OrderRecord,
  PaymentEventRecord,
  SmsVerificationChallengeRecord,
  StudentRecord,
} from './types.ts'

type PayloadLike = {
  create(input: Record<string, unknown>): Promise<Record<string, unknown>>
  find(input: Record<string, unknown>): Promise<{ docs: Record<string, unknown>[] }>
  findByID(input: Record<string, unknown>): Promise<Record<string, unknown>>
  update(input: Record<string, unknown>): Promise<Record<string, unknown>>
}

function idOf(value: unknown) {
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: unknown }).id)
  }

  return String(value)
}

function optionalString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function toStudent(doc: Record<string, unknown>): StudentRecord {
  return {
    birthday: String(doc.birthday || ''),
    classId: idOf(doc.class),
    collegeId: idOf(doc.college),
    gender: doc.gender === 'male' || doc.gender === 'undisclosed' ? doc.gender : 'female',
    id: String(doc.id),
    majorId: idOf(doc.major),
    phone: String(doc.phone || ''),
    realName: String(doc.realName || ''),
    schoolId: idOf(doc.school),
    submittedAt: String(doc.submittedAt || doc.updatedAt || ''),
    verificationStatus:
      doc.verificationStatus === 'verified' || doc.verificationStatus === 'needs_review'
        ? doc.verificationStatus
        : 'pending',
    wechatOpenId: String(doc.wechatOpenId || ''),
    wechatUnionId: optionalString(doc.wechatUnionId),
  }
}

function toGrowthPlan(doc: Record<string, unknown>): GrowthPlanRecord {
  return {
    description: optionalString(doc.description),
    durationDays: Number(doc.durationDays || 0),
    id: String(doc.id),
    isActive: Boolean(doc.isActive),
    priceCents: Number(doc.priceCents || 0),
    title: String(doc.title || ''),
  }
}

function toOrder(doc: Record<string, unknown>): OrderRecord {
  return {
    amountCents: Number(doc.amountCents || 0),
    createdAt: String(doc.createdAt || ''),
    growthPlanId: idOf(doc.growthPlan),
    id: String(doc.id),
    orderNo: String(doc.orderNo || ''),
    paidAt: optionalString(doc.paidAt),
    status:
      doc.status === 'paid' ||
      doc.status === 'cancelled' ||
      doc.status === 'closed' ||
      doc.status === 'failed'
        ? doc.status
        : 'pending',
    studentId: idOf(doc.student),
    wechatTransactionId: optionalString(doc.wechatTransactionId),
  }
}

function toMembership(doc: Record<string, unknown>): MembershipRecord {
  return {
    expiresAt: String(doc.expiresAt || ''),
    growthPlanId: idOf(doc.growthPlan),
    id: String(doc.id),
    sourceOrderNo:
      doc.sourceOrder && typeof doc.sourceOrder === 'object' && 'orderNo' in doc.sourceOrder
        ? String((doc.sourceOrder as { orderNo: unknown }).orderNo)
        : idOf(doc.sourceOrder),
    startedAt: String(doc.startedAt || ''),
    status: doc.status === 'expired' || doc.status === 'cancelled' ? doc.status : 'active',
    studentId: idOf(doc.student),
  }
}

function toPaymentEvent(doc: Record<string, unknown>): PaymentEventRecord {
  return {
    eventKey: String(doc.eventKey || ''),
    id: String(doc.id),
    orderNo:
      doc.order && typeof doc.order === 'object' && 'orderNo' in doc.order
        ? String((doc.order as { orderNo: unknown }).orderNo)
        : idOf(doc.order),
    processedAt: String(doc.processedAt || ''),
    status: doc.status === 'failed' ? 'failed' : 'paid',
    transactionId: optionalString(doc.transactionId),
  }
}

function toSmsVerificationChallenge(doc: Record<string, unknown>): SmsVerificationChallengeRecord {
  return {
    attemptCount: Number(doc.attemptCount || 0),
    codeHash: String(doc.codeHash || ''),
    consumedAt: optionalString(doc.consumedAt),
    expiresAt: String(doc.expiresAt || ''),
    id: String(doc.id),
    phone: String(doc.phone || ''),
    requestedAt: String(doc.requestedAt || ''),
  }
}

function toInstructorStudentSummary(doc: Record<string, unknown>): InstructorStudentSummary {
  return {
    classId: idOf(doc.class),
    collegeId: idOf(doc.college),
    id: String(doc.id),
    majorId: idOf(doc.major),
    phone: String(doc.phone || ''),
    realName: String(doc.realName || ''),
    schoolId: idOf(doc.school),
    submittedAt: String(doc.submittedAt || doc.updatedAt || ''),
    verificationStatus:
      doc.verificationStatus === 'verified' || doc.verificationStatus === 'needs_review'
        ? doc.verificationStatus
        : 'pending',
  }
}

async function first(payload: PayloadLike, collection: string, where: Record<string, unknown>, depth = 0) {
  const result = await payload.find({
    collection,
    depth,
    limit: 1,
    where,
  })

  return result.docs[0]
}

export function createPayloadRepository(payload: PayloadLike): MiniProgramRepository {
  return {
    async createMembership(input) {
      const sourceOrder = await first(payload, 'orders', { orderNo: { equals: input.sourceOrderNo } })
      if (!sourceOrder) {
        throw new MiniProgramError('来源订单不存在', 409)
      }

      return toMembership(
        await payload.create({
          collection: 'memberships',
          data: {
            expiresAt: input.expiresAt,
            growthPlan: input.growthPlanId,
            sourceOrder: sourceOrder.id,
            startedAt: input.startedAt,
            status: input.status,
            student: input.studentId,
          },
        }),
      )
    },
    async createOrder(input) {
      return toOrder(
        await payload.create({
          collection: 'orders',
          data: {
            amountCents: input.amountCents,
            growthPlan: input.growthPlanId,
            orderNo: input.orderNo,
            status: input.status,
            student: input.studentId,
          },
        }),
      )
    },
    async createPaymentEvent(input) {
      const order = await first(payload, 'orders', { orderNo: { equals: input.orderNo } })
      if (!order) {
        throw new MiniProgramError('订单不存在', 404)
      }

      return toPaymentEvent(
        await payload.create({
          collection: 'payment-events',
          data: {
            eventKey: input.eventKey,
            order: order.id,
            processedAt: input.processedAt,
            status: input.status,
            transactionId: input.transactionId,
          },
        }),
      )
    },
    async createSmsVerificationChallenge(input) {
      return toSmsVerificationChallenge(
        await payload.create({
          collection: 'sms-verification-challenges',
          data: {
            attemptCount: input.attemptCount,
            codeHash: input.codeHash,
            consumedAt: input.consumedAt,
            expiresAt: input.expiresAt,
            phone: input.phone,
            requestedAt: input.requestedAt,
          },
        }),
      )
    },
    async createStudent(input) {
      return toStudent(
        await payload.create({
          collection: 'students',
          data: {
            agreedAt: input.submittedAt,
            birthday: input.birthday,
            class: input.classId,
            college: input.collegeId,
            gender: input.gender,
            major: input.majorId,
            phone: input.phone,
            realName: input.realName,
            school: input.schoolId,
            submittedAt: input.submittedAt,
            verificationStatus: input.verificationStatus,
            wechatOpenId: input.wechatOpenId,
            wechatUnionId: input.wechatUnionId,
          },
        }),
      )
    },
    async findActiveGrowthPlanById(id) {
      const doc = await first(payload, 'growth-plans', {
        and: [{ id: { equals: id } }, { isActive: { equals: true } }],
      })

      return doc ? toGrowthPlan(doc) : undefined
    },
    async findMembershipByStudentId(studentId) {
      const doc = await first(
        payload,
        'memberships',
        {
          and: [{ student: { equals: studentId } }, { status: { equals: 'active' } }],
        },
        1,
      )

      return doc ? toMembership(doc) : undefined
    },
    async findOrderByOrderNo(orderNo) {
      const doc = await first(payload, 'orders', { orderNo: { equals: orderNo } }, 1)

      return doc ? toOrder(doc) : undefined
    },
    async findPaymentEventByKey(eventKey) {
      const doc = await first(payload, 'payment-events', { eventKey: { equals: eventKey } }, 1)

      return doc ? toPaymentEvent(doc) : undefined
    },
    async findLatestSmsVerificationChallengeByPhone(phone) {
      const result = await payload.find({
        collection: 'sms-verification-challenges',
        depth: 0,
        limit: 1,
        sort: '-requestedAt',
        where: { phone: { equals: phone } },
      })
      const doc = result.docs[0]

      return doc ? toSmsVerificationChallenge(doc) : undefined
    },
    async findInstructorClassIdsByPhone(phone) {
      const result = await payload.find({
        collection: 'classes',
        depth: 0,
        limit: 200,
        where: {
          'instructorPhones.phone': {
            equals: phone,
          },
        },
      })

      return result.docs.map((doc) => String(doc.id))
    },
    async findStudentsByClassIds(input) {
      if (input.classIds.length === 0) {
        return []
      }

      const where = input.status
        ? {
            and: [
              { class: { in: input.classIds } },
              { verificationStatus: { equals: input.status } },
            ],
          }
        : { class: { in: input.classIds } }
      const result = await payload.find({
        collection: 'students',
        depth: 0,
        limit: 500,
        sort: '-submittedAt',
        where,
      })

      return result.docs.map(toInstructorStudentSummary)
    },
    async findStudentById(id) {
      try {
        return toStudent(await payload.findByID({ collection: 'students', id }))
      } catch {
        return undefined
      }
    },
    async findStudentByOpenId(openId) {
      const doc = await first(payload, 'students', { wechatOpenId: { equals: openId } })

      return doc ? toStudent(doc) : undefined
    },
    async findStudentByPhone(phone) {
      const doc = await first(payload, 'students', { phone: { equals: phone } })

      return doc ? toStudent(doc) : undefined
    },
    async updateMembership(id, input) {
      const sourceOrder = input.sourceOrderNo
        ? await first(payload, 'orders', { orderNo: { equals: input.sourceOrderNo } })
        : undefined

      return toMembership(
        await payload.update({
          collection: 'memberships',
          data: {
            expiresAt: input.expiresAt,
            growthPlan: input.growthPlanId,
            sourceOrder: sourceOrder?.id,
            status: input.status,
          },
          id,
        }),
      )
    },
    async updateOrder(id, input) {
      return toOrder(
        await payload.update({
          collection: 'orders',
          data: {
            paidAt: input.paidAt,
            status: input.status,
            wechatTransactionId: input.wechatTransactionId,
          },
          id,
        }),
      )
    },
    async updateSmsVerificationChallenge(id, input) {
      return toSmsVerificationChallenge(
        await payload.update({
          collection: 'sms-verification-challenges',
          data: {
            attemptCount: input.attemptCount,
            codeHash: input.codeHash,
            consumedAt: input.consumedAt,
            expiresAt: input.expiresAt,
            phone: input.phone,
            requestedAt: input.requestedAt,
          },
          id,
        }),
      )
    },
    async updateStudent(id, input) {
      return toStudent(
        await payload.update({
          collection: 'students',
          data: {
            birthday: input.birthday,
            class: input.classId,
            college: input.collegeId,
            gender: input.gender,
            major: input.majorId,
            phone: input.phone,
            realName: input.realName,
            school: input.schoolId,
            submittedAt: input.submittedAt,
            verificationStatus: input.verificationStatus,
          },
          id,
        }),
      )
    },
    async updateStudentVerificationStatus(id, status) {
      return toStudent(
        await payload.update({
          collection: 'students',
          data: {
            verificationStatus: status,
          },
          id,
        }),
      )
    },
  }
}
