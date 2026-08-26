import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createPhoneVerificationToken,
  verifyPhoneNumberWithWechatCode,
  verifyPhoneVerificationToken,
} from './phone.ts'
import { createSessionToken } from './session.ts'

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
