import { MiniProgramError } from './errors.ts'
import type {
  ContentReservationRecord,
  GrowthPlanRecord,
  InstructorStudentSummary,
  InstructorDataUseCommitmentRecord,
  MembershipRecord,
  MiniProgramRepository,
  NotificationSubscriptionRecord,
  OrderRecord,
  PaymentEventRecord,
  SmsVerificationChallengeRecord,
  StudentVerificationLogRecord,
  StudentRecord,
} from './types.ts'

type PayloadLike = {
  create(input: Record<string, unknown>): Promise<Record<string, unknown>>
  delete(input: Record<string, unknown>): Promise<Record<string, unknown>>
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
    createdAt: String(doc.operatedAt || doc.createdAt || ''),
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
    rawPayload: doc.rawPayload,
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

function toContentReservation(doc: Record<string, unknown>): ContentReservationRecord {
  return {
    contentId: idOf(doc.content),
    id: String(doc.id),
    reservedAt: String(doc.reservedAt || ''),
    status: doc.status === 'cancelled' ? 'cancelled' : 'reserved',
    studentId: idOf(doc.student),
  }
}

function toNotificationSubscription(doc: Record<string, unknown>): NotificationSubscriptionRecord {
  return {
    id: String(doc.id),
    purpose:
      doc.purpose === 'instructor_pending_verification'
        ? 'instructor_pending_verification'
        : 'student_verification_result',
    status: doc.status === 'cancelled' ? 'cancelled' : 'active',
    studentId: idOf(doc.student),
    subscribedAt: String(doc.subscribedAt || doc.updatedAt || ''),
    templateId: String(doc.templateId || ''),
  }
}

function toInstructorDataUseCommitment(
  doc: Record<string, unknown>,
): InstructorDataUseCommitmentRecord {
  return {
    commitmentVersion: String(doc.commitmentVersion || ''),
    confirmedAt: String(doc.confirmedAt || doc.createdAt || ''),
    id: String(doc.id),
    phone: String(doc.phone || ''),
    studentId: idOf(doc.student),
  }
}

function toStudentVerificationLog(doc: Record<string, unknown>): StudentVerificationLogRecord {
  return {
    action: doc.action === 'verified' ? 'verified' : 'needs_review',
    createdAt: String(doc.createdAt || ''),
    id: String(doc.id),
    operatorId: idOf(doc.operator),
    previousStatus:
      doc.previousStatus === 'verified' || doc.previousStatus === 'needs_review'
        ? doc.previousStatus
        : 'pending',
    studentId: idOf(doc.student),
    targetStatus: doc.targetStatus === 'verified' ? 'verified' : 'needs_review',
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
    async createContentReservation(input) {
      return toContentReservation(
        await payload.create({
          collection: 'content-reservations',
          data: {
            content: input.contentId,
            reservedAt: input.reservedAt,
            status: input.status,
            student: input.studentId,
          },
        }),
      )
    },
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
    async createNotificationSubscription(input) {
      return toNotificationSubscription(
        await payload.create({
          collection: 'notification-subscriptions',
          data: {
            purpose: input.purpose,
            status: input.status,
            student: input.studentId,
            subscribedAt: input.subscribedAt,
            templateId: input.templateId,
          },
        }),
      )
    },
    async createInstructorDataUseCommitment(input) {
      return toInstructorDataUseCommitment(
        await payload.create({
          collection: 'instructor-data-use-commitments',
          data: {
            commitmentVersion: input.commitmentVersion,
            confirmedAt: input.confirmedAt,
            phone: input.phone,
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
            rawPayload: input.rawPayload,
            status: input.status,
            transactionId: input.transactionId,
          },
        }),
      )
    },
    async createStudentVerificationLog(input) {
      return toStudentVerificationLog(
        await payload.create({
          collection: 'student-verification-logs',
          data: {
            action: input.action,
            operator: input.operatorId,
            operatedAt: input.createdAt,
            previousStatus: input.previousStatus,
            student: input.studentId,
            targetStatus: input.targetStatus,
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
    async deleteContentReservation(id) {
      await payload.delete({
        collection: 'content-reservations',
        id,
      })
    },
    async deleteSmsVerificationChallenge(id) {
      await payload.delete({
        collection: 'sms-verification-challenges',
        id,
      })
    },
    async findActiveGrowthPlanById(id) {
      const doc = await first(payload, 'growth-plans', {
        and: [{ id: { equals: id } }, { isActive: { equals: true } }],
      })

      return doc ? toGrowthPlan(doc) : undefined
    },
    async findContentReservationByStudentAndContent(input) {
      const doc = await first(
        payload,
        'content-reservations',
        {
          and: [
            { content: { equals: input.contentId } },
            { student: { equals: input.studentId } },
            { status: { equals: 'reserved' } },
          ],
        },
        0,
      )

      return doc ? toContentReservation(doc) : undefined
    },
    async findContentReservationsByStudentId(studentId) {
      const result = await payload.find({
        collection: 'content-reservations',
        depth: 0,
        limit: 100,
        sort: '-reservedAt',
        where: {
          and: [{ student: { equals: studentId } }, { status: { equals: 'reserved' } }],
        },
      })

      return result.docs.map(toContentReservation)
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
    async findNotificationSubscriptionByStudentAndPurpose(input) {
      const doc = await first(
        payload,
        'notification-subscriptions',
        {
          and: [
            { student: { equals: input.studentId } },
            { purpose: { equals: input.purpose } },
          ],
        },
        0,
      )

      return doc ? toNotificationSubscription(doc) : undefined
    },
    async findOrderByOrderNo(orderNo) {
      const doc = await first(payload, 'orders', { orderNo: { equals: orderNo } }, 1)

      return doc ? toOrder(doc) : undefined
    },
    async findOrdersByStudentId(studentId) {
      const result = await payload.find({
        collection: 'orders',
        depth: 1,
        limit: 100,
        sort: '-createdAt',
        where: { student: { equals: studentId } },
      })

      return result.docs.map(toOrder)
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
    async findInstructorDataUseCommitmentByStudentId(studentId) {
      const doc = await first(
        payload,
        'instructor-data-use-commitments',
        { student: { equals: studentId } },
        0,
      )

      return doc ? toInstructorDataUseCommitment(doc) : undefined
    },
    async isActiveCampusSelection(input) {
      const school = await first(payload, 'schools', {
        and: [{ id: { equals: input.schoolId } }, { isActive: { equals: true } }],
      })
      if (!school) return false

      const college = await first(payload, 'colleges', {
        and: [
          { id: { equals: input.collegeId } },
          { school: { equals: input.schoolId } },
          { isActive: { equals: true } },
        ],
      })
      if (!college) return false

      const major = await first(payload, 'majors', {
        and: [
          { id: { equals: input.majorId } },
          { college: { equals: input.collegeId } },
          { isActive: { equals: true } },
        ],
      })
      if (!major) return false

      const classInfo = await first(payload, 'classes', {
        and: [
          { id: { equals: input.classId } },
          { major: { equals: input.majorId } },
          { isActive: { equals: true } },
        ],
      })

      return Boolean(classInfo)
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
    async updateNotificationSubscription(id, input) {
      return toNotificationSubscription(
        await payload.update({
          collection: 'notification-subscriptions',
          data: {
            status: input.status,
            subscribedAt: input.subscribedAt,
            templateId: input.templateId,
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
