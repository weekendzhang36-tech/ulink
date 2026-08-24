const { getHomeData } = require('../../utils/api')

Page({
  data: {
    articles: [],
    growthPlan: null,
    modules: [],
    studentState: null,
  },

  onLoad() {
    getHomeData().then((data) => {
      this.setData(data)
    })
  },

  openGrowthPlan() {
    wx.navigateTo({ url: '/pages/growth-plan/index' })
  },

  openArticle(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/content-detail/index?id=${id}` })
  },

  openVerification() {
    wx.navigateTo({ url: '/pages/verification/index' })
  },
})
