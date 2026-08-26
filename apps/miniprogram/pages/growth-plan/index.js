const {
  cancelOrder,
  createGrowthPlanOrder,
  getGrowthPlan,
  getOrderStatus,
  getSessionToken,
  getStudentState,
  mockConfirmPayment,
} = require('../../utils/api')
const { getGrowthPlanActionState } = require('../../utils/growth-plan-action')
const { hasActivatedMembership } = require('../../utils/membership-result')
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

function cancelPendingOrder(orderNo) {
  if (!orderNo) return Promise.resolve()

  return cancelOrder(orderNo).catch(() => undefined)
}

Page({
  data: {
    actionState: getGrowthPlanActionState({ hasSession: false, plan: null }),
    loading: false,
    membershipState: null,
    plan: null,
    profileCompleted: undefined,
    verificationStatus: '',
  },

  updateActionState(nextData = {}) {
    const data = {
      ...this.data,
      ...nextData,
    }
    this.setData({
      ...nextData,
      actionState: getGrowthPlanActionState({
        hasSession: Boolean(getSessionToken()),
        loading: data.loading,
        membershipState: data.membershipState,
        plan: data.plan,
        profileCompleted: data.profileCompleted,
        verificationStatus: data.verificationStatus,
      }),
    })
  },

  onLoad() {
    getGrowthPlan()
      .then((plan) => {
        this.updateActionState({ plan })

        if (!getSessionToken()) return

        getStudentState()
          .then((state) => {
            this.updateActionState({
              membershipState: state.membershipState,
              profileCompleted: state.profileCompleted,
              verificationStatus: state.verificationStatus,
            })
          })
          .catch((error) => {
            handleProfileGuardError(error, '会员状态加载失败')
          })
      })
      .catch((error) => {
        handleProfileGuardError(error, '成长计划加载失败')
      })
  },

  joinPlan() {
    const actionState = this.data.actionState || getGrowthPlanActionState({ plan: this.data.plan })
    if (actionState.disabled) {
      wx.showToast({ icon: 'none', title: actionState.hintText || actionState.label })
      return
    }
    if (actionState.type === 'view_membership') {
      wx.switchTab({ url: '/pages/mine/index' })
      return
    }
    if (actionState.type === 'complete_profile') {
      wx.redirectTo({ url: '/pages/profile/index' })
      return
    }
    if (actionState.type === 'view_verification') {
      wx.navigateTo({ url: '/pages/verification/index' })
      return
    }
    if (actionState.type !== 'join' || !getSessionToken()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }
    if (!this.data.plan) return

    this.updateActionState({ loading: true })
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
        if (hasActivatedMembership(result)) {
          wx.showToast({ icon: 'success', title: '已加入' })
          wx.switchTab({ url: '/pages/mine/index' })
          return
        }

        wx.showToast({ icon: 'none', title: '支付处理中，请稍后查看' })
      })
      .catch((error) => {
        cancelPendingOrder(createdOrderNo).then(() => {
          handleProfileGuardError(error, '支付未完成')
        })
      })
      .finally(() => {
        this.updateActionState({ loading: false })
      })
  },
})
