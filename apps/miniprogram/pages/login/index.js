const { loginWithWechatCode } = require('../../utils/api')

Page({
  data: {
    loading: false,
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
            if (data.profileCompleted) {
              wx.switchTab({ url: '/pages/home/index' })
              return
            }

            wx.redirectTo({ url: '/pages/profile/index' })
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
