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
        this.setData({
          avatarText: state.name.slice(0, 1),
          state,
        })
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '个人信息加载失败' })
      })
  },

  openVerification() {
    wx.navigateTo({ url: '/pages/verification/index' })
  },

  openInstructorVerifications() {
    wx.navigateTo({ url: '/pages/instructor-verifications/index' })
  },

  openGrowthPlan() {
    wx.navigateTo({ url: '/pages/growth-plan/index' })
  },

  openOrders() {
    wx.navigateTo({ url: '/pages/orders/index' })
  },

  openReservations() {
    wx.navigateTo({ url: '/pages/reservations/index' })
  },

  openLegal() {
    wx.navigateTo({ url: '/pages/legal/index' })
  },
})
