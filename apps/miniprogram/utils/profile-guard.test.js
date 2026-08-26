const assert = require('node:assert/strict')
const test = require('node:test')

const { getProfileGuardAction, getProfileGuardRedirect } = require('./profile-guard')

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

test('does not route regular forbidden errors to profile form', () => {
  assert.equal(
    getProfileGuardRedirect({
      message: '开通友邻成长计划后可预约会员专属内容',
      statusCode: 403,
    }),
    '',
  )
})

test('returns redirect action for incomplete profile errors', () => {
  assert.deepEqual(
    getProfileGuardAction({ message: '请先完善学生资料', statusCode: 403 }, '加载失败'),
    {
      type: 'redirect',
      url: '/pages/profile/index',
    },
  )
})

test('returns toast action for regular API errors', () => {
  assert.deepEqual(getProfileGuardAction({ message: '订单加载失败', statusCode: 500 }, '加载失败'), {
    title: '订单加载失败',
    type: 'toast',
  })
})

test('uses fallback title when error message is empty', () => {
  assert.deepEqual(getProfileGuardAction({}, '加载失败'), {
    title: '加载失败',
    type: 'toast',
  })
})
