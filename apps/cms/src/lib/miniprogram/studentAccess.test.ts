import assert from 'node:assert/strict'
import test from 'node:test'

import { createSessionToken } from './session.ts'
import { requireCompletedStudentProfile } from './studentAccess.ts'
import { createMemoryRepository } from './testing/memoryRepository.ts'

const now = new Date('2026-08-26T10:00:00.000Z')
const secret = 'test-secret'

function tokenFor(studentId?: string) {
  return createSessionToken({
    expiresInSeconds: 60 * 60,
    now,
    openId: studentId ? 'openid_001' : 'openid_without_profile',
    secret,
    studentId,
  })
}

test('requires login before entering student growth services', async () => {
  await assert.rejects(
    () =>
      requireCompletedStudentProfile({
        now,
        repository: createMemoryRepository(),
        secret,
      }),
    (error: Error & { status?: number }) => {
      assert.equal(error.message, '请先登录')
      assert.equal(error.status, 401)

      return true
    },
  )
})

test('requires a completed student profile before entering growth services', async () => {
  await assert.rejects(
    () =>
      requireCompletedStudentProfile({
        now,
        repository: createMemoryRepository({ seedStudents: false }),
        secret,
        sessionToken: tokenFor(),
      }),
    (error: Error & { status?: number }) => {
      assert.equal(error.message, '请先完善学生资料')
      assert.equal(error.status, 403)

      return true
    },
  )
})

test('returns the current student after login and profile completion', async () => {
  const student = await requireCompletedStudentProfile({
    now,
    repository: createMemoryRepository(),
    secret,
    sessionToken: tokenFor('student_001'),
  })

  assert.equal(student.id, 'student_001')
  assert.equal(student.realName, '林一诺')
})
