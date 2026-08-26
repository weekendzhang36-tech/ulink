import assert from 'node:assert/strict'
import test from 'node:test'

import { getProfileStatus } from './profileStatus.ts'
import { createSessionToken } from './session.ts'
import { createMemoryRepository } from './testing/memoryRepository.ts'

const secret = 'test-secret'

function tokenFor(openId: string, studentId?: string) {
  return createSessionToken({
    expiresInSeconds: 60 * 60,
    now: new Date('2026-08-26T10:00:00.000Z'),
    openId,
    secret,
    studentId,
  })
}

test('returns only Mini Program display fields from profile status', async () => {
  const repository = createMemoryRepository({ seedInstructor: true })
  repository.memberships.set('membership_001', {
    expiresAt: '2027-02-25T10:00:00.000Z',
    growthPlanId: 'growth_plan_001',
    id: 'membership_001',
    sourceOrderNo: 'order_paid_once',
    startedAt: '2026-08-26T10:00:00.000Z',
    status: 'active',
    studentId: 'student_001',
  })

  const result = await getProfileStatus({
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
    sessionToken: tokenFor('openid_001', 'student_001'),
  })
  const response = result as Record<string, unknown>
  const student = response.student as Record<string, unknown>

  assert.equal(response.profileCompleted, true)
  assert.equal(response.membership, undefined)
  assert.equal(student.name, '林一诺')
  assert.equal(student.verificationStatus, 'pending')
  assert.equal(student.wechatOpenId, undefined)
  assert.equal(student.wechatUnionId, undefined)
  assert.equal(student.id, undefined)
  assert.equal(result.membershipState.isActive, true)
  assert.deepEqual(result.instructor, {
    canManageStudents: false,
    classCount: 0,
  })
})

test('returns incomplete profile status without student internals', async () => {
  const result = await getProfileStatus({
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository: createMemoryRepository({ seedStudents: false }),
    secret,
    sessionToken: tokenFor('openid_without_profile'),
  })

  assert.equal(result.profileCompleted, false)
  assert.equal(result.student, null)
  assert.equal(result.membershipState.isActive, false)
})
