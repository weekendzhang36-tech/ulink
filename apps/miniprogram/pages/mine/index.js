const { endSession, getGrowthPlan, getSessionToken, getStudentState } = require('../../utils/api')
const { normalizeMembershipBenefits } = require('../../utils/membership-benefits')
const { handleProfileGuardError } = require('../../utils/profile-guard')

Page({
  data: {
    membershipBenefits: [],
    state: null,
  },

  onShow() {
    if (!getSessionToken()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }

    Promise.all([getStudentState(), getGrowthPlan()])
      .then(([state, growthPlan]) => {
        this.setData({
          avatarText: state.name.slice(0, 1),
          membershipBenefits: normalizeMembershipBenefits(growthPlan),
          state,
        })
      })
      .catch((error) => {
        handleProfileGuardError(error, '个人信息加载失败')
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

  signOut() {
    wx.showModal({
      cancelText: '取消',
      confirmColor: '#ff3b30',
      confirmText: '退出',
      content: '退出后需要重新微信登录才能继续使用成长服务。',
      title: '退出登录',
      success: (result) => {
        if (!result.confirm) return

        const { redirectUrl } = endSession()
        wx.redirectTo({ url: redirectUrl })
      },
    })
  },
})
