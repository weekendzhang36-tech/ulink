export type Gender = 'male' | 'female' | 'undisclosed'
export type VerificationStatus = 'pending' | 'verified' | 'needs_review'
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'closed' | 'failed'
export type MembershipStatus = 'active' | 'expired' | 'cancelled'
export type PaymentStatus = 'paid' | 'failed'
export type ContentReservationStatus = 'reserved' | 'cancelled'
export type NotificationSubscriptionPurpose =
  | 'student_verification_result'
  | 'instructor_pending_verification'
export type NotificationSubscriptionStatus = 'active' | 'cancelled'

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

export interface InstructorStudentSummary {
  classId: string
  className?: string
  collegeId: string
  collegeName?: string
  id: string
  majorId: string
  majorName?: string
  phone: string
  realName: string
  schoolId: string
  schoolName?: string
  submittedAt: string
  verificationStatus: VerificationStatus
}

export interface StudentProfileInput {
  agreedToPolicies: boolean
  birthday: string
  classId: string
  collegeId: string
  gender: Gender
  majorId: string
  phone: string
  phoneVerificationToken: string
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
  rawPayload?: unknown
  status: PaymentStatus
  transactionId?: string
}

export interface ContentReservationRecord {
  contentId: string
  id: string
  reservedAt: string
  status: ContentReservationStatus
  studentId: string
}

export interface SmsVerificationChallengeRecord {
  attemptCount: number
  codeHash: string
  consumedAt?: string
  expiresAt: string
  id: string
  phone: string
  requestedAt: string
}

export interface NotificationSubscriptionRecord {
  deliveredAt?: string
  id: string
  purpose: NotificationSubscriptionPurpose
  status: NotificationSubscriptionStatus
  studentId: string
  subscribedAt: string
  templateId: string
}

export interface InstructorDataUseCommitmentRecord {
  commitmentVersion: string
  confirmedAt: string
  id: string
  phone: string
  studentId: string
}

export interface StudentVerificationLogRecord {
  action: Extract<VerificationStatus, 'needs_review' | 'verified'>
  createdAt: string
  id: string
  operatorId: string
  previousStatus: VerificationStatus
  studentId: string
  targetStatus: Extract<VerificationStatus, 'needs_review' | 'verified'>
}

export interface PaymentParams {
  mock?: boolean
  nonceStr: string
  orderNo: string
  packageValue: string
  paySign: string
  signType: 'RSA'
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

export interface WechatPhoneGateway {
  getPhoneNumber(code: string): Promise<{
    countryCode?: string
    phoneNumber?: string
    purePhoneNumber: string
  }>
}

export interface SmsGateway {
  sendCode(input: { code: string; phone: string }): Promise<void>
}

export interface NotificationGateway {
  sendInstructorPendingVerification(input: {
    instructor: StudentRecord
    pendingCount: number
    student: StudentRecord
    submittedAt: string
    subscription: NotificationSubscriptionRecord
  }): Promise<void>
  sendStudentVerificationResult(input: {
    reviewedAt: string
    status: Extract<VerificationStatus, 'needs_review' | 'verified'>
    student: StudentRecord
    subscription: NotificationSubscriptionRecord
  }): Promise<void>
}

export interface MiniProgramRepository {
  createContentReservation(input: Omit<ContentReservationRecord, 'id'>): Promise<ContentReservationRecord>
  createMembership(input: Omit<MembershipRecord, 'id'>): Promise<MembershipRecord>
  createNotificationSubscription(
    input: Omit<NotificationSubscriptionRecord, 'id'>,
  ): Promise<NotificationSubscriptionRecord>
  createInstructorDataUseCommitment(
    input: Omit<InstructorDataUseCommitmentRecord, 'id'>,
  ): Promise<InstructorDataUseCommitmentRecord>
  createOrder(input: Omit<OrderRecord, 'id'>): Promise<OrderRecord>
  createPaymentEvent(input: Omit<PaymentEventRecord, 'id'>): Promise<PaymentEventRecord>
  createStudentVerificationLog(
    input: Omit<StudentVerificationLogRecord, 'id'>,
  ): Promise<StudentVerificationLogRecord>
  createSmsVerificationChallenge(
    input: Omit<SmsVerificationChallengeRecord, 'id'>,
  ): Promise<SmsVerificationChallengeRecord>
  createStudent(input: Omit<StudentRecord, 'id'>): Promise<StudentRecord>
  deleteContentReservation(id: string): Promise<void>
  deleteSmsVerificationChallenge(id: string): Promise<void>
  findActiveGrowthPlanById(id: string): Promise<GrowthPlanRecord | undefined>
  findContentReservationById(id: string): Promise<ContentReservationRecord | undefined>
  findContentReservationByStudentAndContent(input: {
    contentId: string
    studentId: string
  }): Promise<ContentReservationRecord | undefined>
  findContentReservationsByStudentId(studentId: string): Promise<ContentReservationRecord[]>
  findMembershipByStudentId(studentId: string): Promise<MembershipRecord | undefined>
  findNotificationSubscriptionByStudentAndPurpose(input: {
    purpose: NotificationSubscriptionPurpose
    studentId: string
  }): Promise<NotificationSubscriptionRecord | undefined>
  findOrderByOrderNo(orderNo: string): Promise<OrderRecord | undefined>
  findOrdersByStudentId(studentId: string): Promise<OrderRecord[]>
  findPaymentEventByKey(eventKey: string): Promise<PaymentEventRecord | undefined>
  findLatestSmsVerificationChallengeByPhone(
    phone: string,
  ): Promise<SmsVerificationChallengeRecord | undefined>
  findInstructorClassIdsByPhone(phone: string): Promise<string[]>
  findInstructorStudentsByClassId(classId: string): Promise<StudentRecord[]>
  findInstructorDataUseCommitmentByStudentId(
    studentId: string,
  ): Promise<InstructorDataUseCommitmentRecord | undefined>
  isActiveCampusSelection(input: {
    classId: string
    collegeId: string
    majorId: string
    schoolId: string
  }): Promise<boolean>
  findStudentsByClassIds(input: {
    classIds: string[]
    status?: VerificationStatus
  }): Promise<InstructorStudentSummary[]>
  findStudentById(id: string): Promise<StudentRecord | undefined>
  findStudentByOpenId(openId: string): Promise<StudentRecord | undefined>
  findStudentByPhone(phone: string): Promise<StudentRecord | undefined>
  updateContentReservation(
    id: string,
    input: Partial<Omit<ContentReservationRecord, 'id'>>,
  ): Promise<ContentReservationRecord>
  updateStudentVerificationStatus(id: string, status: VerificationStatus): Promise<StudentRecord>
  updateMembership(id: string, input: Partial<Omit<MembershipRecord, 'id'>>): Promise<MembershipRecord>
  updateOrder(id: string, input: Partial<Omit<OrderRecord, 'id'>>): Promise<OrderRecord>
  updateNotificationSubscription(
    id: string,
    input: Partial<Omit<NotificationSubscriptionRecord, 'id'>>,
  ): Promise<NotificationSubscriptionRecord>
  updateSmsVerificationChallenge(
    id: string,
    input: Partial<Omit<SmsVerificationChallengeRecord, 'id'>>,
  ): Promise<SmsVerificationChallengeRecord>
  updateStudent(id: string, input: Partial<Omit<StudentRecord, 'id'>>): Promise<StudentRecord>
}
