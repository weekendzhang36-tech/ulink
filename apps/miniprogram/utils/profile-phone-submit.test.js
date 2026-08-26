const assert = require('node:assert/strict')
const test = require('node:test')

const { canSubmitProfilePhone } = require('./profile-phone-submit')

test('allows editing profile with an unchanged verified phone without a fresh token', () => {
  assert.equal(
    canSubmitProfilePhone({
      mode: 'edit',
      originalPhone: '13800000001',
      phone: '13800000001',
      phoneVerificationToken: '',
      phoneVerified: true,
    }),
    true,
  )
})

test('requires phone verification token for new profiles or changed phones', () => {
  assert.equal(
    canSubmitProfilePhone({
      mode: 'create',
      originalPhone: '',
      phone: '13800000001',
      phoneVerificationToken: '',
      phoneVerified: true,
    }),
    false,
  )
  assert.equal(
    canSubmitProfilePhone({
      mode: 'edit',
      originalPhone: '13800000001',
      phone: '13800000002',
      phoneVerificationToken: '',
      phoneVerified: true,
    }),
    false,
  )
  assert.equal(
    canSubmitProfilePhone({
      mode: 'edit',
      originalPhone: '13800000001',
      phone: '13800000002',
      phoneVerificationToken: 'signed-token',
      phoneVerified: true,
    }),
    true,
  )
})
