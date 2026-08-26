import type {
  GrowthPlanRecord,
  MembershipRecord,
  MiniProgramRepository,
  OrderRecord,
  PaymentEventRecord,
  StudentRecord,
} from '../types.ts'

function nextId(prefix: string, size: number) {
  return `${prefix}_${String(size + 1).padStart(3, '0')}`
}

export function createMemoryRepository(options: { seedStudents?: boolean } = {}) {
  const students = new Map<string, StudentRecord>(options.seedStudents === false ? [] : [
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
  ])
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
  const paymentEvents = new Map<string, PaymentEventRecord>()

  const repository: MiniProgramRepository & {
    growthPlans: Map<string, GrowthPlanRecord>
    memberships: Map<string, MembershipRecord>
    orders: Map<string, OrderRecord>
    paymentEvents: Map<string, PaymentEventRecord>
    students: Map<string, StudentRecord>
  } = {
    growthPlans,
    memberships,
    orders,
    paymentEvents,
    students,
    async createMembership(input) {
      const membership = { ...input, id: nextId('membership', memberships.size) }
      memberships.set(membership.id, membership)

      return membership
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
    async createStudent(input) {
      const student = { ...input, id: nextId('student', students.size) }
      students.set(student.id, student)

      return student
    },
    async findActiveGrowthPlanById(id) {
      const growthPlan = growthPlans.get(id)

      return growthPlan?.isActive ? growthPlan : undefined
    },
    async findMembershipByStudentId(studentId) {
      return [...memberships.values()].find((membership) => membership.studentId === studentId)
    },
    async findOrderByOrderNo(orderNo) {
      return orders.get(orderNo)
    },
    async findPaymentEventByKey(eventKey) {
      return paymentEvents.get(eventKey)
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
    async updateStudent(id, input) {
      const current = students.get(id)
      if (!current) {
        throw new Error(`Student not found: ${id}`)
      }
      const next = { ...current, ...input }
      students.set(id, next)

      return next
    },
  }

  return repository
}
