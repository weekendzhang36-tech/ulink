const assert = require('node:assert/strict')
const test = require('node:test')

const { getProfileGuardRedirect } = require('./profile-guard')

test('routes unauthenticated errors to login', () => {
  assert.equal(getProfileGuardRedirect({ message: '请先登录', statusCode: 401 }), '/pages/login/index')
})

test('routes incomplete profile errors to profile form', () => {
  assert.equal(
    getProfileGuardRedirect({ message: '请先完善学生资料', statusCode: 403 }),
    '/pages/profile/index',
  )
})

test('does not redirect unrelated API errors', () => {
  assert.equal(getProfileGuardRedirect({ message: '首页加载失败', statusCode: 500 }), '')
})
