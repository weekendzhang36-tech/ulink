import assert from 'node:assert/strict'
import test from 'node:test'

import { getMiniProgramHomeData } from './home.ts'
import { createSessionToken } from './session.ts'
import { createMemoryRepository } from './testing/memoryRepository.ts'

const secret = 'test-secret'

function payloadFor(docs: Record<string, unknown>[] = []) {
  return {
    find: async ({ collection }: Record<string, unknown>) => ({
      docs:
        collection === 'growth-plans'
          ? [
              {
                durationDays: 183,
                id: 'growth_plan_001',
                isActive: true,
                priceCents: 500,
                title: '友邻成长计划',
              },
            ]
          : docs,
    }),
    findByID: async () => {
      throw new Error('not used')
    },
  }
}

function tokenFor(openId: string, studentId?: string) {
  return createSessionToken({
    expiresInSeconds: 60 * 60,
    now: new Date('2026-08-26T10:00:00.000Z'),
    openId,
    secret,
    studentId,
  })
}

test('requires login before loading Mini Program home data', async () => {
  await assert.rejects(
    () =>
      getMiniProgramHomeData({
        now: new Date('2026-08-26T10:01:00.000Z'),
        payload: payloadFor(),
        repository: createMemoryRepository(),
        secret,
      }),
    /请先登录/,
  )
})

test('requires completed student profile before loading Mini Program home data', async () => {
  await assert.rejects(
    () =>
      getMiniProgramHomeData({
        now: new Date('2026-08-26T10:01:00.000Z'),
        payload: payloadFor(),
        repository: createMemoryRepository(),
        secret,
        sessionToken: tokenFor('openid_without_profile'),
      }),
    /请先完善学生资料/,
  )
})

test('returns home data for a student with completed profile', async () => {
  const result = await getMiniProgramHomeData({
    now: new Date('2026-08-26T10:01:00.000Z'),
    payload: payloadFor(),
    repository: createMemoryRepository(),
    secret,
    sessionToken: tokenFor('openid_001', 'student_001'),
  })

  assert.equal(result.studentState?.name, '林一诺')
  assert.equal(result.studentState?.verificationStatus, '待认证')
  assert.equal(result.growthPlan.title, '友邻成长计划')
  assert.deepEqual(
    result.modules.map((module) => module.key),
    ['career_planning', 'practice', 'finance_foundation', 'culture_exchange'],
  )
})

test('returns a needs-review home message that asks the student to update profile', async () => {
  const repository = createMemoryRepository()
  const student = repository.students.get('student_001')
  assert.ok(student)
  repository.students.set('student_001', {
    ...student,
    verificationStatus: 'needs_review',
  })

  const result = await getMiniProgramHomeData({
    now: new Date('2026-08-26T10:01:00.000Z'),
    payload: payloadFor(),
    repository,
    secret,
    sessionToken: tokenFor('openid_001', 'student_001'),
  })

  assert.equal(result.studentState?.verificationStatus, '需确认')
  assert.equal(result.studentState?.message, '资料需要确认，请检查姓名、学院、专业和班级后重新提交。')
})
