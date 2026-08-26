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

test('requests module contents and service links with session auth and encoded query', async () => {
  const storage = {
    ulinkSessionToken: 'signed-session-token',
  }
  const requests = []
  global.getApp = () => ({
    globalData: {
      apiBaseURL: 'https://api.example.com/miniprogram',
      demoMode: false,
    },
  })
  global.wx = {
    getStorageSync(key) {
      return storage[key]
    },
    request(options) {
      requests.push(options)
      options.success({
        data: { data: [] },
        statusCode: 200,
      })
    },
  }

  const { getContentsByModule, getServiceLinksByModule } = require('./api')

  await getContentsByModule('finance foundation')
  await getServiceLinksByModule('finance foundation')

  assert.deepEqual(
    requests.map((request) => ({
      authorization: request.header.Authorization,
      url: request.url,
    })),
    [
      {
        authorization: 'Bearer signed-session-token',
        url: 'https://api.example.com/miniprogram/content?module=finance%20foundation',
      },
      {
        authorization: 'Bearer signed-session-token',
        url: 'https://api.example.com/miniprogram/service-links?module=finance%20foundation',
      },
    ],
  )
})
