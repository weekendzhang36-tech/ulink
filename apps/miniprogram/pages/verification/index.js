const { getSessionToken, getStudentState } = require('../../utils/api')

Page({
  data: {
    state: null,
  },

  onShow() {
    if (!getSessionToken()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }

    getStudentState()
      .then((state) => {
        this.setData({ state })
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '认证状态加载失败' })
      })
  },
})
