const { getMembershipOrders, getSessionToken } = require('../../utils/api')
const { handleProfileGuardError } = require('../../utils/profile-guard')

function dateText(value) {
  return value ? value.slice(0, 10) : ''
}

function normalizeOrder(order) {
  return {
    ...order,
    createdDateText: dateText(order.createdAt),
    paidDateText: dateText(order.paidAt),
  }
}

Page({
  data: {
    loading: true,
    orders: [],
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
})
