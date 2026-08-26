const {
  cancelOrder: cancelMembershipOrder,
  getMembershipOrders,
  getOrderStatus,
  getSessionToken,
  mockConfirmPayment,
  resumeOrderPayment,
} = require('../../utils/api')
const { hasActivatedMembership } = require('../../utils/membership-result')
const { getOrderActionState } = require('../../utils/order-action')
const { handleProfileGuardError } = require('../../utils/profile-guard')

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

function dateText(value) {
  return value ? value.slice(0, 10) : ''
}

function normalizeOrder(order) {
  return {
    ...order,
    actionState: getOrderActionState(order),
    createdDateText: dateText(order.createdAt),
    paidDateText: dateText(order.paidAt),
  }
}

Page({
  data: {
    cancelingOrderNo: '',
    loading: true,
    orders: [],
    payingOrderNo: '',
  },

  onShow() {
    if (!getSessionToken()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }

    this.loadOrders()
  },

  loadOrders() {
    this.setData({ loading: true })
    getMembershipOrders()
      .then((data) => {
        this.setData({
          orders: (data.orders || []).map(normalizeOrder),
        })
      })
      .catch((error) => {
        handleProfileGuardError(error, '订单加载失败')
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  cancelOrder(event) {
    const orderNo = event.currentTarget.dataset.orderNo
    if (!orderNo || this.data.cancelingOrderNo || this.data.payingOrderNo) return

    wx.showModal({
      cancelText: '再想想',
      confirmColor: '#ff3b30',
      confirmText: '取消订单',
      content: '取消后该订单不能继续支付，如需加入可重新下单。',
      title: '取消订单',
      success: (result) => {
        if (!result.confirm) return

        this.setData({ cancelingOrderNo: orderNo })
        cancelMembershipOrder(orderNo)
          .then((data) => {
            const nextOrder = normalizeOrder(data.order || {})
            this.setData({
              orders: this.data.orders.map((order) =>
                order.orderNo === orderNo ? nextOrder : order,
              ),
            })
            wx.showToast({ icon: 'success', title: '已取消' })
          })
          .catch((error) => {
            handleProfileGuardError(error, '取消失败')
          })
          .finally(() => {
            this.setData({ cancelingOrderNo: '' })
          })
      },
    })
  },

  continuePay(event) {
    const orderNo = event.currentTarget.dataset.orderNo
    if (!orderNo || this.data.cancelingOrderNo || this.data.payingOrderNo) return

    this.setData({ payingOrderNo: orderNo })
    resumeOrderPayment(orderNo)
      .then(({ paymentParams }) => {
        if (paymentParams.mock) {
          return mockConfirmPayment(orderNo).then(() => getOrderStatus(orderNo))
        }

        return requestWechatPayment(paymentParams).then(() => waitForPaidOrder(orderNo))
      })
      .then((result) => {
        if (result.order) {
          this.setData({
            orders: this.data.orders.map((order) =>
              order.orderNo === orderNo ? normalizeOrder(result.order) : order,
            ),
          })
        }

        if (hasActivatedMembership(result)) {
          wx.showToast({ icon: 'success', title: '已加入' })
          return
        }

        wx.showToast({ icon: 'none', title: '支付处理中，请稍后查看' })
      })
      .catch((error) => {
        handleProfileGuardError(error, '支付未完成')
      })
      .finally(() => {
        this.setData({ payingOrderNo: '' })
      })
  },
})
