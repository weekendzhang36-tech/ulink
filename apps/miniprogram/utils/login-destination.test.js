const assert = require('node:assert/strict')
const test = require('node:test')

const { getExistingSessionDestination, getLoginResultDestination } = require('./login-destination')

test('sends a completed existing session to home', () => {
  assert.deepEqual(getExistingSessionDestination({ profileCompleted: true }), {
    method: 'switchTab',
    url: '/pages/home/index',
  })
})

test('sends an incomplete existing session to the profile form', () => {
  assert.deepEqual(getExistingSessionDestination({ profileCompleted: false }), {
    method: 'redirectTo',
    url: '/pages/profile/index',
  })
})

test('does not redirect before existing session status is known', () => {
  assert.equal(getExistingSessionDestination(undefined), undefined)
})

test('sends a completed profile login result to home', () => {
  assert.deepEqual(getLoginResultDestination({ profileCompleted: true }), {
    method: 'switchTab',
    url: '/pages/home/index',
  })
})

test('sends an incomplete profile login result to the profile form', () => {
  assert.deepEqual(getLoginResultDestination({ profileCompleted: false }), {
    method: 'redirectTo',
    url: '/pages/profile/index',
  })
})
