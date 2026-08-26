const assert = require('node:assert/strict')
const test = require('node:test')

const {
  buildSubmittedProfileSummary,
  getProfileSubmitSuccessUrl,
} = require('./profile-submission-success')

test('routes new profile submissions to the submitted confirmation page', () => {
  assert.equal(getProfileSubmitSuccessUrl('create'), '/pages/profile-submitted/index')
})

test('routes edited profile submissions back to the verification status page', () => {
  assert.equal(getProfileSubmitSuccessUrl('edit'), '/pages/verification/index')
})

test('builds a readable submitted profile summary from student state', () => {
  assert.deepEqual(
    buildSubmittedProfileSummary({
      className: '金融学 2026 级 1 班',
      name: '林一诺',
      school: '广东金融学院',
      verificationStatus: '待认证',
    }),
    [
      { label: '姓名', value: '林一诺' },
      { label: '学校', value: '广东金融学院' },
      { label: '班级', value: '金融学 2026 级 1 班' },
      { label: '状态', value: '待认证' },
    ],
  )
})
