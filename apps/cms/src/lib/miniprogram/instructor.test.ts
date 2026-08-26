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
