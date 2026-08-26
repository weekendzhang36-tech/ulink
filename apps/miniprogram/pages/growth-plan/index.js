const {
  cancelOrder,
  createGrowthPlanOrder,
  getGrowthPlan,
  getOrderStatus,
  getSessionToken,
  mockConfirmPayment,
} = require('../../utils/api')

function requestWechatPayment(paymentParams) {
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      nonceStr: paymentParams.nonceStr,
      package: paymentParams.packageValue,
      paySign: paymentParams.paySign,
      signType: paymentParams.signType || 'RSA',
      timeStamp: paymentParams.timeStamp,
      fail: reject,
      success: resolve,
    })
  })
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function waitForPaidOrder(orderNo, remainingAttempts = 4) {
  return getOrderStatus(orderNo).then((result) => {
    if (result.order && result.order.status === 'paid') return result
    if (remainingAttempts <= 0) return result

    return wait(1000).then(() => waitForPaidOrder(orderNo, remainingAttempts - 1))
  })
}

function cancelPendingOrder(orderNo) {
  if (!orderNo) return Promise.resolve()

  return cancelOrder(orderNo).catch(() => undefined)
}

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
    let createdOrderNo = ''
    createGrowthPlanOrder(this.data.plan.id)
      .then(({ order, paymentParams }) => {
        createdOrderNo = order.orderNo
        if (paymentParams.mock) {
          return mockConfirmPayment(order.orderNo).then(() => getOrderStatus(order.orderNo))
        }

        return requestWechatPayment(paymentParams).then(() => waitForPaidOrder(order.orderNo))
      })
      .then((result) => {
        if (result.order && result.order.status === 'paid' && result.membership) {
          wx.showToast({ icon: 'success', title: '已加入' })
          return
        }

        wx.showToast({ icon: 'none', title: '支付处理中，请稍后查看' })
      })
      .catch((error) => {
        cancelPendingOrder(createdOrderNo).then(() => {
          wx.showToast({ icon: 'none', title: error.message || '支付未完成' })
        })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },
})
