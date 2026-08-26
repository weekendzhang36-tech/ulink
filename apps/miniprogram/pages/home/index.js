const { getHomeData, getSessionToken } = require('../../utils/api')
const { getProfileGuardRedirect } = require('../../utils/profile-guard')

Page({
  data: {
    articles: [],
    growthPlan: null,
    instructorState: null,
    modules: [],
    studentState: null,
  },

  onShow() {
    if (!getSessionToken()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }

    getHomeData()
      .then((data) => {
        this.setData(data)
      })
      .catch((error) => {
        const redirectUrl = getProfileGuardRedirect(error)
        if (redirectUrl) {
          wx.navigateTo({ url: redirectUrl })
          return
        }

        wx.showToast({ icon: 'none', title: error.message || '首页加载失败' })
      })
  },

  openGrowthPlan() {
    wx.navigateTo({ url: '/pages/growth-plan/index' })
  },

  openModule(event) {
    const { key, title } = event.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/content-list/index?module=${key}&title=${encodeURIComponent(title)}`,
    })
  },

  openArticle(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/content-detail/index?id=${id}` })
  },

  openVerification() {
    wx.navigateTo({ url: '/pages/verification/index' })
  },

  openInstructorVerifications() {
    wx.navigateTo({ url: '/pages/instructor-verifications/index' })
  },
})
