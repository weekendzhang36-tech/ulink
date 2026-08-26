import assert from 'node:assert/strict'
import test from 'node:test'

import {
  confirmInstructorDataUseCommitment,
  listInstructorVerificationStudents,
  reviewInstructorStudents,
} from './instructor.ts'
import { createSessionToken } from './session.ts'
import { createMemoryRepository } from './testing/memoryRepository.ts'

const secret = 'test-secret'

function instructorToken() {
  return createSessionToken({
    expiresInSeconds: 60 * 60,
    now: new Date('2026-08-26T10:00:00.000Z'),
    openId: 'openid_instructor',
    secret,
    studentId: 'student_instructor',
  })
}

test('lists only pending students from classes assigned to the instructor phone', async () => {
  const repository = createMemoryRepository({
    seedInstructor: true,
    seedInstructorDataUseCommitment: true,
    seedStudents: true,
  })

  const result = await listInstructorVerificationStudents({
    input: {
      sessionToken: instructorToken(),
      status: 'pending',
    },
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
  })

  assert.deepEqual(
    result.students.map((student) => student.id),
    ['student_001'],
  )
  assert.equal(result.pendingCount, 1)
})

test('filters instructor verification students by an assigned class', async () => {
  const repository = createMemoryRepository({
    seedInstructor: true,
    seedInstructorDataUseCommitment: true,
    seedStudents: true,
  })
  const originalFindInstructorClassIdsByPhone = repository.findInstructorClassIdsByPhone
  repository.findInstructorClassIdsByPhone = async (phone) => {
    if (phone === '13900000001') return ['class_001', 'class_999']

    return originalFindInstructorClassIdsByPhone(phone)
  }

  const result = await listInstructorVerificationStudents({
    input: {
      classId: 'class_999',
      sessionToken: instructorToken(),
      status: 'pending',
    },
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
  })

  assert.deepEqual(
    result.students.map((student) => student.id),
    ['student_other_class'],
  )
  assert.deepEqual(result.classIds, ['class_001', 'class_999'])
  assert.deepEqual(result.classOptions, [
    { id: 'class_001', name: '金融学 2026-1 班' },
    { id: 'class_999', name: '金融学 2026-9 班' },
  ])
  assert.equal(result.pendingCount, 2)
})

test('returns no students when the class filter is outside instructor assignments', async () => {
  const repository = createMemoryRepository({
    seedInstructor: true,
    seedInstructorDataUseCommitment: true,
    seedStudents: true,
  })

  const result = await listInstructorVerificationStudents({
    input: {
      classId: 'class_not_assigned',
      sessionToken: instructorToken(),
      status: 'pending',
    },
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
  })

  assert.deepEqual(result.students, [])
  assert.equal(result.pendingCount, 1)
})

test('requires a data use commitment before listing instructor verification students', async () => {
  const repository = createMemoryRepository({ seedInstructor: true, seedStudents: true })

  await assert.rejects(
    () =>
      listInstructorVerificationStudents({
        input: {
          sessionToken: instructorToken(),
          status: 'pending',
        },
        now: new Date('2026-08-26T10:01:00.000Z'),
        repository,
        secret,
      }),
    /请先确认管理端数据使用承诺/,
  )
})

test('records the instructor data use commitment before exposing verification students', async () => {
  const repository = createMemoryRepository({ seedInstructor: true, seedStudents: true })

  const commitment = await confirmInstructorDataUseCommitment({
    input: {
      sessionToken: instructorToken(),
    },
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
  })
  const result = await listInstructorVerificationStudents({
    input: {
      sessionToken: instructorToken(),
      status: 'pending',
    },
    now: new Date('2026-08-26T10:02:00.000Z'),
    repository,
    secret,
  })

  assert.equal(commitment.studentId, 'student_instructor')
  assert.equal(commitment.confirmedAt, '2026-08-26T10:01:00.000Z')
  assert.deepEqual(
    result.students.map((student) => student.id),
    ['student_001'],
  )
})

test('rejects review actions for students outside instructor assigned classes', async () => {
  const repository = createMemoryRepository({
    seedInstructor: true,
    seedInstructorDataUseCommitment: true,
    seedStudents: true,
  })

  await assert.rejects(
    () =>
      reviewInstructorStudents({
        input: {
          action: 'verified',
          sessionToken: instructorToken(),
          studentIds: ['student_other_class'],
        },
        now: new Date('2026-08-26T10:01:00.000Z'),
        repository,
        secret,
      }),
    /无权操作/,
  )

  assert.equal(repository.students.get('student_other_class')?.verificationStatus, 'pending')
})

test('updates assigned students to verified in a batch review action', async () => {
  const repository = createMemoryRepository({
    seedInstructor: true,
    seedInstructorDataUseCommitment: true,
    seedStudents: true,
  })

  const result = await reviewInstructorStudents({
    input: {
      action: 'verified',
      sessionToken: instructorToken(),
      studentIds: ['student_001'],
    },
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
  })

  assert.equal(result.updatedStudents.length, 1)
  assert.equal(repository.students.get('student_001')?.verificationStatus, 'verified')
})

test('sends a subscribed student their verification review result', async () => {
  const repository = createMemoryRepository({
    seedInstructor: true,
    seedInstructorDataUseCommitment: true,
    seedStudents: true,
  })
  await repository.createNotificationSubscription({
    purpose: 'student_verification_result',
    status: 'active',
    studentId: 'student_001',
    subscribedAt: '2026-08-26T09:30:00.000Z',
    templateId: 'template_student_result',
  })
  const deliveries: unknown[] = []

  const result = await reviewInstructorStudents({
    input: {
      action: 'verified',
      sessionToken: instructorToken(),
      studentIds: ['student_001'],
    },
    notificationGateway: {
      async sendInstructorPendingVerification() {},
      async sendStudentVerificationResult(input) {
        deliveries.push(input)
      },
    },
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
  })

  assert.deepEqual(deliveries, [
    {
      reviewedAt: '2026-08-26T10:01:00.000Z',
      status: 'verified',
      student: {
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
        verificationStatus: 'verified',
        wechatOpenId: 'openid_001',
      },
      subscription: {
        id: 'notification_subscription_001',
        purpose: 'student_verification_result',
        status: 'active',
        studentId: 'student_001',
        subscribedAt: '2026-08-26T09:30:00.000Z',
        templateId: 'template_student_result',
      },
    },
  ])
  assert.deepEqual(result.notificationResults, [
    {
      studentId: 'student_001',
      status: 'sent',
    },
  ])
  assert.deepEqual(repository.notificationSubscriptions.get('notification_subscription_001'), {
    deliveredAt: '2026-08-26T10:01:00.000Z',
    id: 'notification_subscription_001',
    purpose: 'student_verification_result',
    status: 'cancelled',
    studentId: 'student_001',
    subscribedAt: '2026-08-26T09:30:00.000Z',
    templateId: 'template_student_result',
  })
})

test('keeps verification review when student notification delivery fails', async () => {
  const repository = createMemoryRepository({
    seedInstructor: true,
    seedInstructorDataUseCommitment: true,
    seedStudents: true,
  })
  await repository.createNotificationSubscription({
    purpose: 'student_verification_result',
    status: 'active',
    studentId: 'student_001',
    subscribedAt: '2026-08-26T09:30:00.000Z',
    templateId: 'template_student_result',
  })

  const result = await reviewInstructorStudents({
    input: {
      action: 'needs_review',
      sessionToken: instructorToken(),
      studentIds: ['student_001'],
    },
    notificationGateway: {
      async sendInstructorPendingVerification() {},
      async sendStudentVerificationResult() {
        throw new Error('wechat subscribe message failed')
      },
    },
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
  })

  assert.equal(repository.students.get('student_001')?.verificationStatus, 'needs_review')
  assert.equal(repository.studentVerificationLogs.size, 1)
  assert.deepEqual(repository.notificationSubscriptions.get('notification_subscription_001'), {
    id: 'notification_subscription_001',
    purpose: 'student_verification_result',
    status: 'active',
    studentId: 'student_001',
    subscribedAt: '2026-08-26T09:30:00.000Z',
    templateId: 'template_student_result',
  })
  assert.deepEqual(result.notificationResults, [
    {
      errorMessage: 'wechat subscribe message failed',
      status: 'failed',
      studentId: 'student_001',
    },
  ])
})

test('records verification logs when an instructor reviews assigned students', async () => {
  const repository = createMemoryRepository({
    seedInstructor: true,
    seedInstructorDataUseCommitment: true,
    seedStudents: true,
  })

  await reviewInstructorStudents({
    input: {
      action: 'needs_review',
      sessionToken: instructorToken(),
      studentIds: ['student_001'],
    },
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
  })

  const logs = (
    repository as unknown as {
      studentVerificationLogs?: Map<
        string,
        {
          action: string
          createdAt: string
          operatorId: string
          previousStatus: string
          studentId: string
          targetStatus: string
        }
      >
    }
  ).studentVerificationLogs

  assert.equal(logs?.size, 1)
  assert.deepEqual([...logs!.values()][0], {
    action: 'needs_review',
    createdAt: '2026-08-26T10:01:00.000Z',
    id: 'student_verification_log_001',
    operatorId: 'student_instructor',
    previousStatus: 'pending',
    studentId: 'student_001',
    targetStatus: 'needs_review',
  })
})
