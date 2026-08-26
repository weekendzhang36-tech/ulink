const assert = require('node:assert/strict')
const test = require('node:test')

const {
  createLocalDevLoginCode,
  shouldUseLocalDevLoginFallback,
} = require('./wechat-login-code')

test('uses local dev login fallback only when explicitly enabled', () => {
  assert.equal(shouldUseLocalDevLoginFallback({ localDevWechatLoginFallback: true }), true)
  assert.equal(shouldUseLocalDevLoginFallback({ localDevWechatLoginFallback: false }), false)
  assert.equal(shouldUseLocalDevLoginFallback({}), false)
  assert.equal(shouldUseLocalDevLoginFallback(undefined), false)
})

test('creates a clearly marked local dev login code', () => {
  assert.equal(createLocalDevLoginCode(new Date('2026-08-27T00:00:00.000Z')), 'local-dev-login-1787788800000')
})
