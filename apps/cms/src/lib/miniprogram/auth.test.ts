import assert from 'node:assert/strict'
import test from 'node:test'

import { createWechatLoginGateway, loginWithWechatCode } from './auth.ts'
import { verifySessionToken } from './session.ts'
import { createMemoryRepository } from './testing/memoryRepository.ts'

test('returns a signed session without creating a student before profile submission', async () => {
  const repository = createMemoryRepository({ seedStudents: false })

  const result = await loginWithWechatCode({
    input: { code: 'wx_code_001' },
    now: new Date('2026-08-26T10:00:00.000Z'),
    repository,
    secret: 'test-secret',
    wechatGateway: {
      exchangeCode: async (code) => ({
        openId: `openid_${code}`,
        unionId: `union_${code}`,
      }),
    },
  })
  const session = verifySessionToken({
    now: new Date('2026-08-26T10:01:00.000Z'),
    secret: 'test-secret',
    token: result.sessionToken,
  })

  assert.equal(session.openId, 'openid_wx_code_001')
  assert.equal(result.profileCompleted, false)
  assert.equal(repository.students.size, 0)
})

test('includes student identity when the WeChat user already submitted a profile', async () => {
  const repository = createMemoryRepository()

  const result = await loginWithWechatCode({
    input: { code: '001' },
    now: new Date('2026-08-26T10:00:00.000Z'),
    repository,
    secret: 'test-secret',
    wechatGateway: {
      exchangeCode: async () => ({ openId: 'openid_001' }),
    },
  })
  const session = verifySessionToken({
    now: new Date('2026-08-26T10:01:00.000Z'),
    secret: 'test-secret',
    token: result.sessionToken,
  })

  assert.equal(session.studentId, 'student_001')
  assert.equal(result.profileCompleted, true)
})

test('rejects mock WeChat login when production environment enables the mock flag', () => {
  assert.throws(
    () =>
      createWechatLoginGateway({
        MINIPROGRAM_MOCK_WECHAT_LOGIN: 'true',
        NODE_ENV: 'production',
      }),
    /本地 mock 登录不能在生产环境启用/,
  )
})
