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

function navigateToDestination(destination) {
  if (!destination) return

  wx[destination.method]({ url: destination.url })
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
    wx.login({
      fail: () => {
        this.setData({ loading: false })
        wx.showToast({ icon: 'none', title: '微信登录失败' })
      },
      success: ({ code }) => {
        loginWithWechatCode(code)
          .then((data) => {
            navigateToDestination(getLoginResultDestination(data))
          })
          .catch((error) => {
            wx.showToast({ icon: 'none', title: error.message || '登录失败' })
          })
          .finally(() => {
            this.setData({ loading: false })
          })
      },
    })
  },
})
