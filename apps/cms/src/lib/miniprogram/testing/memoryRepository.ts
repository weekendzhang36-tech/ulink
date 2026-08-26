import type {
  ContentReservationRecord,
  GrowthPlanRecord,
  InstructorStudentSummary,
  MembershipRecord,
  MiniProgramRepository,
  NotificationSubscriptionRecord,
  OrderRecord,
  PaymentEventRecord,
  SmsVerificationChallengeRecord,
  StudentRecord,
} from '../types.ts'

function nextId(prefix: string, size: number) {
  return `${prefix}_${String(size + 1).padStart(3, '0')}`
}

export function createMemoryRepository(
  options: { seedInstructor?: boolean; seedStudents?: boolean } = {},
) {
  const seededStudents: [string, StudentRecord][] = options.seedStudents === false ? [] : [
    [
      'student_001',
      {
        birthday: '2007-09-01',
        classId: 'class_001',
        collegeId: 'college_001',
        gender: 'female',
        id: 'student_001',
        majorId: 'major_001',
        phone: '13800000001',
        realName: '林一诺',
        schoolId: 'school_001',
        submittedAt: '2026-08-26T09:00:00.000Z',
        verificationStatus: 'pending',
        wechatOpenId: 'openid_001',
      },
    ],
    [
      'student_other_class',
      {
        birthday: '2007-09-01',
        classId: 'class_999',
        collegeId: 'college_001',
        gender: 'female',
        id: 'student_other_class',
        majorId: 'major_001',
        phone: '13800000999',
        realName: '其他班学生',
        schoolId: 'school_001',
        submittedAt: '2026-08-26T09:05:00.000Z',
        verificationStatus: 'pending',
        wechatOpenId: 'openid_other_class',
      },
    ],
  ]
  if (options.seedInstructor) {
    seededStudents.push([
      'student_instructor',
      {
        birthday: '1990-01-01',
        classId: 'class_staff',
        collegeId: 'college_staff',
        gender: 'undisclosed',
        id: 'student_instructor',
        majorId: 'major_staff',
        phone: '13900000001',
        realName: '指导员',
        schoolId: 'school_001',
        submittedAt: '2026-08-26T08:00:00.000Z',
        verificationStatus: 'verified',
        wechatOpenId: 'openid_instructor',
      },
    ])
  }
  const students = new Map<string, StudentRecord>(seededStudents)
  const instructorClasses = new Map<string, string[]>([['13900000001', ['class_001']]])
  const growthPlans = new Map<string, GrowthPlanRecord>([
    [
      'growth_plan_001',
      {
        durationDays: 183,
        id: 'growth_plan_001',
        isActive: true,
        priceCents: 500,
        title: '友邻成长计划',
      },
    ],
  ])
  const orders = new Map<string, OrderRecord>([
    [
      'order_paid_once',
      {
        amountCents: 500,
        createdAt: '2026-08-26T09:59:00.000Z',
        growthPlanId: 'growth_plan_001',
        id: 'order_001',
        orderNo: 'order_paid_once',
        status: 'pending',
        studentId: 'student_001',
      },
    ],
  ])
  const memberships = new Map<string, MembershipRecord>()
  const notificationSubscriptions = new Map<string, NotificationSubscriptionRecord>()
  const contentReservations = new Map<string, ContentReservationRecord>()
  const paymentEvents = new Map<string, PaymentEventRecord>()
  const smsVerificationChallenges = new Map<string, SmsVerificationChallengeRecord>()
  const campusSelections = new Set([
    'school_001/college_001/major_001/class_001',
    'school_001/college_001/major_001/class_999',
    'school_001/college_staff/major_staff/class_staff',
  ])

  const repository: MiniProgramRepository & {
    contentReservations: Map<string, ContentReservationRecord>
    growthPlans: Map<string, GrowthPlanRecord>
    memberships: Map<string, MembershipRecord>
    notificationSubscriptions: Map<string, NotificationSubscriptionRecord>
    orders: Map<string, OrderRecord>
    paymentEvents: Map<string, PaymentEventRecord>
    smsVerificationChallenges: Map<string, SmsVerificationChallengeRecord>
    students: Map<string, StudentRecord>
  } = {
    contentReservations,
    growthPlans,
    memberships,
    notificationSubscriptions,
    orders,
    paymentEvents,
    smsVerificationChallenges,
    students,
    async createContentReservation(input) {
      const reservation = { ...input, id: nextId('content_reservation', contentReservations.size) }
      contentReservations.set(reservation.id, reservation)

      return reservation
    },
    async createMembership(input) {
      const membership = { ...input, id: nextId('membership', memberships.size) }
      memberships.set(membership.id, membership)

      return membership
    },
    async createNotificationSubscription(input) {
      const subscription = {
        ...input,
        id: nextId('notification_subscription', notificationSubscriptions.size),
      }
      notificationSubscriptions.set(subscription.id, subscription)

      return subscription
    },
    async createOrder(input) {
      const order = { ...input, id: nextId('order', orders.size) }
      orders.set(order.orderNo, order)

      return order
    },
    async createPaymentEvent(input) {
      const paymentEvent = { ...input, id: nextId('payment_event', paymentEvents.size) }
      paymentEvents.set(paymentEvent.eventKey, paymentEvent)

      return paymentEvent
    },
    async createSmsVerificationChallenge(input) {
      const challenge = { ...input, id: nextId('sms_challenge', smsVerificationChallenges.size) }
      smsVerificationChallenges.set(challenge.id, challenge)

      return challenge
    },
    async createStudent(input) {
      const student = { ...input, id: nextId('student', students.size) }
      students.set(student.id, student)

      return student
    },
    async deleteContentReservation(id) {
      contentReservations.delete(id)
    },
    async findActiveGrowthPlanById(id) {
      const growthPlan = growthPlans.get(id)

      return growthPlan?.isActive ? growthPlan : undefined
    },
    async findContentReservationByStudentAndContent(input) {
      return [...contentReservations.values()].find(
        (reservation) =>
          reservation.contentId === input.contentId &&
          reservation.studentId === input.studentId &&
          reservation.status === 'reserved',
      )
    },
    async findMembershipByStudentId(studentId) {
      return [...memberships.values()].find((membership) => membership.studentId === studentId)
    },
    async findNotificationSubscriptionByStudentAndPurpose(input) {
      return [...notificationSubscriptions.values()].find(
        (subscription) =>
          subscription.studentId === input.studentId && subscription.purpose === input.purpose,
      )
    },
    async findOrderByOrderNo(orderNo) {
      return orders.get(orderNo)
    },
    async findOrdersByStudentId(studentId) {
      return [...orders.values()]
        .filter((order) => order.studentId === studentId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    },
    async findPaymentEventByKey(eventKey) {
      return paymentEvents.get(eventKey)
    },
    async findLatestSmsVerificationChallengeByPhone(phone) {
      return [...smsVerificationChallenges.values()]
        .filter((challenge) => challenge.phone === phone)
        .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt))[0]
    },
    async findInstructorClassIdsByPhone(phone) {
      return instructorClasses.get(phone) || []
    },
    async isActiveCampusSelection(input) {
      return campusSelections.has(
        `${input.schoolId}/${input.collegeId}/${input.majorId}/${input.classId}`,
      )
    },
    async findStudentsByClassIds(input) {
      return [...students.values()]
        .filter((student) => input.classIds.includes(student.classId))
        .filter((student) => !input.status || student.verificationStatus === input.status)
        .map<InstructorStudentSummary>((student) => ({
          classId: student.classId,
          collegeId: student.collegeId,
          id: student.id,
          majorId: student.majorId,
          phone: student.phone,
          realName: student.realName,
          schoolId: student.schoolId,
          submittedAt: student.submittedAt,
          verificationStatus: student.verificationStatus,
        }))
    },
    async findStudentById(id) {
      return students.get(id)
    },
    async findStudentByOpenId(openId) {
      return [...students.values()].find((student) => student.wechatOpenId === openId)
    },
    async findStudentByPhone(phone) {
      return [...students.values()].find((student) => student.phone === phone)
    },
    async updateMembership(id, input) {
      const current = memberships.get(id)
      if (!current) {
        throw new Error(`Membership not found: ${id}`)
      }
      const next = { ...current, ...input }
      memberships.set(id, next)

      return next
    },
    async updateOrder(id, input) {
      const current = [...orders.values()].find((order) => order.id === id)
      if (!current) {
        throw new Error(`Order not found: ${id}`)
      }
      const next = { ...current, ...input }
      orders.set(next.orderNo, next)

      return next
    },
    async updateNotificationSubscription(id, input) {
      const current = notificationSubscriptions.get(id)
      if (!current) {
        throw new Error(`Notification subscription not found: ${id}`)
      }
      const next = { ...current, ...input }
      notificationSubscriptions.set(id, next)

      return next
    },
    async updateSmsVerificationChallenge(id, input) {
      const current = smsVerificationChallenges.get(id)
      if (!current) {
        throw new Error(`SMS verification challenge not found: ${id}`)
      }
      const next = { ...current, ...input }
      smsVerificationChallenges.set(id, next)

      return next
    },
    async updateStudent(id, input) {
      const current = students.get(id)
      if (!current) {
        throw new Error(`Student not found: ${id}`)
      }
      const next = { ...current, ...input }
      students.set(id, next)

      return next
    },
    async updateStudentVerificationStatus(id, status) {
      const current = students.get(id)
      if (!current) {
        throw new Error(`Student not found: ${id}`)
      }
      const next = { ...current, verificationStatus: status }
      students.set(id, next)

      return next
    },
  }

  return repository
}
