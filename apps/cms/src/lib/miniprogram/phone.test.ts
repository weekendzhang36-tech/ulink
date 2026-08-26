import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createPhoneVerificationToken,
  createSmsGateway,
  createWechatPhoneGateway,
  requestSmsPhoneVerification,
  verifyPhoneNumberWithSmsCode,
  verifyPhoneNumberWithWechatCode,
  verifyPhoneVerificationToken,
} from './phone.ts'
import { createSessionToken } from './session.ts'
import { createMemoryRepository } from './testing/memoryRepository.ts'

const secret = 'test-secret'
const now = new Date('2026-08-26T10:00:00.000Z')

function sessionToken() {
  return createSessionToken({
    expiresInSeconds: 60 * 60,
    now,
    openId: 'openid_001',
    secret,
    studentId: 'student_001',
  })
}

test('creates a phone verification token from a WeChat phone code', async () => {
  const result = await verifyPhoneNumberWithWechatCode({
    input: {
      phoneCode: 'phone_code_001',
      sessionToken: sessionToken(),
    },
    now,
    secret,
    wechatPhoneGateway: {
      getPhoneNumber: async (phoneCode) => ({
        countryCode: '86',
        phoneNumber: `+86-${phoneCode}`,
        purePhoneNumber: '13800000001',
      }),
    },
  })

  assert.equal(result.phone, '13800000001')
  assert.equal(
    verifyPhoneVerificationToken({
      expectedPhone: '13800000001',
      now: new Date('2026-08-26T10:01:00.000Z'),
      secret,
      token: result.phoneVerificationToken,
    }).phone,
    '13800000001',
  )
})

test('rejects a phone verification token for a different phone number', () => {
  const token = createPhoneVerificationToken({
    expiresInSeconds: 60 * 10,
    now,
    phone: '13800000001',
    secret,
  })

  assert.throws(
    () =>
      verifyPhoneVerificationToken({
        expectedPhone: '13800000002',
        now: new Date('2026-08-26T10:01:00.000Z'),
        secret,
        token,
      }),
    /手机号验证不匹配/,
  )
})

test('verifies a phone number through a persisted SMS code challenge', async () => {
  const repository = createMemoryRepository({ seedStudents: false })
  const sentMessages: { code: string; phone: string }[] = []

  const requestResult = await requestSmsPhoneVerification({
    generateCode: () => '246810',
    input: {
      phone: '13800000003',
      sessionToken: sessionToken(),
    },
    now,
    repository,
    secret,
    smsGateway: {
      sendCode: async ({ code, phone }) => {
        sentMessages.push({ code, phone })
      },
    },
  })

  assert.equal(requestResult.phone, '13800000003')
  assert.deepEqual(sentMessages, [{ code: '246810', phone: '13800000003' }])

  const verifyResult = await verifyPhoneNumberWithSmsCode({
    input: {
      phone: '13800000003',
      sessionToken: sessionToken(),
      smsCode: '246810',
    },
    now: new Date('2026-08-26T10:02:00.000Z'),
    repository,
    secret,
  })

  assert.equal(verifyResult.phone, '13800000003')
  assert.equal(
    verifyPhoneVerificationToken({
      expectedPhone: '13800000003',
      now: new Date('2026-08-26T10:03:00.000Z'),
      secret,
      token: verifyResult.phoneVerificationToken,
    }).phone,
    '13800000003',
  )
  assert.equal([...repository.smsVerificationChallenges.values()][0].consumedAt, '2026-08-26T10:02:00.000Z')
})

test('does not keep an SMS challenge when sending the code fails', async () => {
  const repository = createMemoryRepository({ seedStudents: false })

  await assert.rejects(
    () =>
      requestSmsPhoneVerification({
        generateCode: () => '246810',
        input: {
          phone: '13800000003',
          sessionToken: sessionToken(),
        },
        now,
        repository,
        secret,
        smsGateway: {
          sendCode: async () => {
            throw new Error('sms gateway failed')
          },
        },
      }),
    /sms gateway failed/,
  )

  assert.equal(repository.smsVerificationChallenges.size, 0)
})

test('rejects mock WeChat phone when production environment enables the mock flag', () => {
  assert.throws(
    () =>
      createWechatPhoneGateway({
        MINIPROGRAM_MOCK_WECHAT_PHONE: 'true',
        NODE_ENV: 'production',
      }),
    /本地 mock 微信手机号不能在生产环境启用/,
  )
})

test('rejects mock SMS when production environment enables the mock flag', () => {
  assert.throws(
    () =>
      createSmsGateway({
        MINIPROGRAM_MOCK_SMS: 'true',
        NODE_ENV: 'production',
      }),
    /本地 mock 短信不能在生产环境启用/,
  )
})
