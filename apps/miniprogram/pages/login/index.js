const {
  clearSessionToken,
  getSessionToken,
  getStudentState,
  loginWithWechatCode,
} = require('../../utils/api')
const {
  getExistingSessionDestination,
  getLoginResultDestination,
} = require('../../utils/login-destination')
const {
  createLocalDevLoginCode,
  shouldUseLocalDevLoginFallback,
} = require('../../utils/wechat-login-code')

function navigateToDestination(destination) {
  if (!destination) return

  wx[destination.method]({ url: destination.url })
}

function showLoginError(error) {
  wx.showToast({ icon: 'none', title: (error && error.message) || '登录失败' })
}

Page({
  data: {
    loading: false,
  },

  onLoad() {
    if (!getSessionToken()) return

    this.setData({ loading: true })
    getStudentState()
      .then((state) => {
        navigateToDestination(getExistingSessionDestination(state))
      })
      .catch((error) => {
        if (error.statusCode === 401 || (error.message || '').includes('请先登录')) {
          clearSessionToken()
          return
        }

        wx.showToast({ icon: 'none', title: error.message || '登录状态确认失败' })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  startLogin() {
    this.setData({ loading: true })
    const loginWithCode = (code) =>
      loginWithWechatCode(code)
        .then((data) => {
          navigateToDestination(getLoginResultDestination(data))
        })
        .catch(showLoginError)
        .finally(() => {
          this.setData({ loading: false })
        })

    wx.login({
      fail: () => {
        const app = getApp()
        if (shouldUseLocalDevLoginFallback(app.globalData)) {
          loginWithCode(createLocalDevLoginCode())
          return
        }

        showLoginError(new Error('微信登录失败'))
        this.setData({ loading: false })
      },
      success: ({ code }) => {
        loginWithCode(code)
      },
    })
  },
})
