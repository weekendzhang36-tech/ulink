import assert from 'node:assert/strict'
import test from 'node:test'

import { createSessionToken, verifySessionToken } from './session.ts'

test('verifies a signed session token created for a WeChat identity', () => {
  const token = createSessionToken({
    expiresInSeconds: 60,
    now: new Date('2026-08-26T10:00:00.000Z'),
    openId: 'openid_001',
    secret: 'test-secret',
    studentId: 'student_001',
  })

  const session = verifySessionToken({
    now: new Date('2026-08-26T10:00:30.000Z'),
    secret: 'test-secret',
    token,
  })

  assert.equal(session.openId, 'openid_001')
  assert.equal(session.studentId, 'student_001')
})

test('rejects a token when its payload has been changed', () => {
  const token = createSessionToken({
    expiresInSeconds: 60,
    now: new Date('2026-08-26T10:00:00.000Z'),
    openId: 'openid_001',
    secret: 'test-secret',
  })
  const [payload, signature] = token.split('.')
  const changedPayload = Buffer.from(
    JSON.stringify({
      exp: 1798279260,
      openId: 'openid_999',
    }),
  ).toString('base64url')

  assert.throws(
    () =>
      verifySessionToken({
        now: new Date('2026-08-26T10:00:30.000Z'),
        secret: 'test-secret',
        token: `${changedPayload}.${signature}`,
      }),
    /Invalid session token/,
  )

  assert.notEqual(payload, changedPayload)
})

test('rejects an expired session token', () => {
  const token = createSessionToken({
    expiresInSeconds: 10,
    now: new Date('2026-08-26T10:00:00.000Z'),
    openId: 'openid_001',
    secret: 'test-secret',
  })

  assert.throws(
    () =>
      verifySessionToken({
        now: new Date('2026-08-26T10:00:11.000Z'),
        secret: 'test-secret',
        token,
      }),
    /Session token expired/,
  )
})
