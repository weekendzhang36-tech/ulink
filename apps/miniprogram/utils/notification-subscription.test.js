const assert = require('node:assert/strict')
const test = require('node:test')

const {
  getTemplateIdForPurpose,
  shouldRecordSubscribeResult,
} = require('./notification-subscription')

test('reads subscription template id from Mini Program global configuration', () => {
  const app = {
    globalData: {
      subscriptionTemplates: {
        instructorPendingVerification: 'template_instructor_pending',
        studentVerificationResult: 'template_student_result',
      },
    },
  }

  assert.equal(getTemplateIdForPurpose(app, 'student_verification_result'), 'template_student_result')
  assert.equal(
    getTemplateIdForPurpose(app, 'instructor_pending_verification'),
    'template_instructor_pending',
  )
})

test('records only accepted subscribe message result', () => {
  assert.equal(shouldRecordSubscribeResult({ template_001: 'accept' }, 'template_001'), true)
  assert.equal(shouldRecordSubscribeResult({ template_001: 'reject' }, 'template_001'), false)
  assert.equal(shouldRecordSubscribeResult({ template_001: 'ban' }, 'template_001'), false)
})
