export type Gender = 'male' | 'female' | 'undisclosed'
export type VerificationStatus = 'pending' | 'verified' | 'needs_review'
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'closed' | 'failed'
export type MembershipStatus = 'active' | 'expired' | 'cancelled'
export type PaymentStatus = 'paid' | 'failed'

export interface MiniProgramSession {
  exp: number
  openId: string
  studentId?: string
  unionId?: string
}

export interface StudentRecord {
  birthday: string
  classId: string
  collegeId: string
  gender: Gender
  id: string
  majorId: string
  phone: string
  realName: string
  schoolId: string
  submittedAt: string
  verificationStatus: VerificationStatus
  wechatOpenId: string
  wechatUnionId?: string
}

export interface StudentProfileInput {
  agreedToPolicies: boolean
  birthday: string
  classId: string
  collegeId: string
  gender: Gender
  majorId: string
  phone: string
  realName: string
  schoolId: string
  sessionToken: string
}

export interface GrowthPlanRecord {
  description?: string
  durationDays: number
  id: string
  isActive: boolean
  priceCents: number
  title: string
}

export interface OrderRecord {
  amountCents: number
  createdAt: string
  growthPlanId: string
  id: string
  orderNo: string
  paidAt?: string
  status: OrderStatus
  studentId: string
  wechatTransactionId?: string
}

export interface MembershipRecord {
  expiresAt: string
  growthPlanId: string
  id: string
  sourceOrderNo: string
  startedAt: string
  status: MembershipStatus
  studentId: string
}

export interface PaymentEventRecord {
  eventKey: string
  id: string
  orderNo: string
  processedAt: string
  status: PaymentStatus
  transactionId?: string
}

export interface PaymentParams {
  mock?: boolean
  nonceStr: string
  orderNo: string
  packageValue: string
  paySign: string
  timeStamp: string
  totalFee: number
}

export interface PaymentGateway {
  createPaymentParams(input: {
    amountCents: number
    body: string
    orderNo: string
    student: StudentRecord
  }): Promise<PaymentParams>
}

export interface WechatLoginGateway {
  exchangeCode(code: string): Promise<{
    openId: string
    unionId?: string
  }>
}

export interface MiniProgramRepository {
  createMembership(input: Omit<MembershipRecord, 'id'>): Promise<MembershipRecord>
  createOrder(input: Omit<OrderRecord, 'id'>): Promise<OrderRecord>
  createPaymentEvent(input: Omit<PaymentEventRecord, 'id'>): Promise<PaymentEventRecord>
  createStudent(input: Omit<StudentRecord, 'id'>): Promise<StudentRecord>
  findActiveGrowthPlanById(id: string): Promise<GrowthPlanRecord | undefined>
  findMembershipByStudentId(studentId: string): Promise<MembershipRecord | undefined>
  findOrderByOrderNo(orderNo: string): Promise<OrderRecord | undefined>
  findPaymentEventByKey(eventKey: string): Promise<PaymentEventRecord | undefined>
  findStudentById(id: string): Promise<StudentRecord | undefined>
  findStudentByOpenId(openId: string): Promise<StudentRecord | undefined>
  findStudentByPhone(phone: string): Promise<StudentRecord | undefined>
  updateMembership(id: string, input: Partial<Omit<MembershipRecord, 'id'>>): Promise<MembershipRecord>
  updateOrder(id: string, input: Partial<Omit<OrderRecord, 'id'>>): Promise<OrderRecord>
  updateStudent(id: string, input: Partial<Omit<StudentRecord, 'id'>>): Promise<StudentRecord>
}
