const assert = require('node:assert/strict')
const test = require('node:test')

test('clears stored session token before redirecting to login', () => {
  const storage = {
    ulinkSessionToken: 'signed-session-token',
  }
  global.wx = {
    removeStorageSync(key) {
      delete storage[key]
    },
  }

  const { endSession } = require('./api')

  assert.deepEqual(endSession(), {
    redirectUrl: '/pages/login/index',
  })
  assert.equal(storage.ulinkSessionToken, undefined)
})
