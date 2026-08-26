import assert from 'node:assert/strict'
import test from 'node:test'

import { recordNotificationSubscription } from './notification.ts'
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

test('requires a completed student profile before recording notification subscription', async () => {
  const repository = createMemoryRepository({ seedStudents: false })

  await assert.rejects(
    () =>
      recordNotificationSubscription({
        input: {
          purpose: 'student_verification_result',
          sessionToken: tokenFor('openid_without_profile'),
          templateId: 'template_student_result',
        },
        now: new Date('2026-08-26T10:01:00.000Z'),
        repository,
        secret,
      }),
    /请先完善学生资料/,
  )

  assert.equal(repository.notificationSubscriptions.size, 0)
})

test('updates an existing notification subscription for the same student and purpose', async () => {
  const repository = createMemoryRepository()

  const first = await recordNotificationSubscription({
    input: {
      purpose: 'student_verification_result',
      sessionToken: tokenFor('openid_001', 'student_001'),
      templateId: 'template_student_result',
    },
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
  })
  const second = await recordNotificationSubscription({
    input: {
      purpose: 'student_verification_result',
      sessionToken: tokenFor('openid_001', 'student_001'),
      templateId: 'template_student_result_v2',
    },
    now: new Date('2026-08-26T10:10:00.000Z'),
    repository,
    secret,
  })

  assert.equal(second.subscription.id, first.subscription.id)
  assert.equal(second.subscription.templateId, 'template_student_result_v2')
  assert.equal(second.subscription.subscribedAt, '2026-08-26T10:10:00.000Z')
  assert.equal(repository.notificationSubscriptions.size, 1)
})
