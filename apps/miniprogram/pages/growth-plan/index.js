const { createGrowthPlanOrder, getGrowthPlan, getSessionToken, mockConfirmPayment } = require('../../utils/api')

Page({
  data: {
    loading: false,
    plan: null,
  },

  onLoad() {
    getGrowthPlan()
      .then((plan) => {
        this.setData({ plan })
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '成长计划加载失败' })
      })
  },

  joinPlan() {
    if (!getSessionToken()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }
    if (!this.data.plan) return

    this.setData({ loading: true })
    createGrowthPlanOrder(this.data.plan.id)
      .then(({ order, paymentParams }) => {
        if (paymentParams.mock) {
          return mockConfirmPayment(order.orderNo)
        }

        return new Promise((resolve, reject) => {
          wx.requestPayment({
            nonceStr: paymentParams.nonceStr,
            package: paymentParams.packageValue,
            paySign: paymentParams.paySign,
            signType: 'RSA',
            timeStamp: paymentParams.timeStamp,
            fail: reject,
            success: resolve,
          })
        })
      })
      .then(() => {
        wx.showToast({ icon: 'success', title: '已加入' })
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '支付未完成' })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },
})
