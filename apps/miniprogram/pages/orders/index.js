const {
  cancelOrder: cancelMembershipOrder,
  getMembershipOrders,
  getSessionToken,
} = require('../../utils/api')
const { getOrderActionState } = require('../../utils/order-action')
const { handleProfileGuardError } = require('../../utils/profile-guard')

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
    if (!orderNo || this.data.cancelingOrderNo) return

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
})
