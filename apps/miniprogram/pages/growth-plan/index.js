const { getGrowthPlan } = require('../../utils/api')

Page({
  data: {
    plan: null,
  },

  onLoad() {
    getGrowthPlan().then((plan) => {
      this.setData({ plan })
    })
  },

  joinPlan() {
    wx.showToast({
      title: '已模拟加入',
      icon: 'success',
    })
  },
})
