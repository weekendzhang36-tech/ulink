const assert = require('node:assert/strict')
const test = require('node:test')

const { getLegalDocument } = require('./legal-documents')

test('resolves user agreement and privacy policy documents', () => {
  const agreement = getLegalDocument('user-agreement')
  const privacy = getLegalDocument('privacy-policy')

  assert.equal(agreement.title, '用户协议')
  assert.match(agreement.body, /U Link/)
  assert.equal(privacy.title, '隐私政策')
  assert.match(privacy.body, /手机号/)
})

test('does not resolve unknown legal document types', () => {
  assert.equal(getLegalDocument('payment-policy'), undefined)
})
