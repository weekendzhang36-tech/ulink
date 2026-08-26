const {
  getSessionToken,
  getStudentState,
  recordNotificationSubscription,
} = require('../../utils/api')
const {
  getTemplateIdForPurpose,
  shouldRecordSubscribeResult,
} = require('../../utils/notification-subscription')

Page({
  data: {
    subscribing: false,
    state: null,
  },

  onShow() {
    if (!getSessionToken()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }

    getStudentState()
      .then((state) => {
        this.setData({ state })
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '认证状态加载失败' })
      })
  },

  subscribeVerificationResult() {
    const purpose = 'student_verification_result'
    const templateId = getTemplateIdForPurpose(getApp(), purpose)
    if (!templateId) {
      wx.showToast({ icon: 'none', title: '提醒模板待配置' })
      return
    }

    this.setData({ subscribing: true })
    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      success: (result) => {
        if (!shouldRecordSubscribeResult(result, templateId)) {
          wx.showToast({ icon: 'none', title: '未开启提醒' })
          return
        }

        recordNotificationSubscription({ purpose, templateId })
          .then(() => {
            wx.showToast({ title: '提醒已开启' })
          })
          .catch((error) => {
            wx.showToast({ icon: 'none', title: error.message || '开启提醒失败' })
          })
          .finally(() => {
            this.setData({ subscribing: false })
          })
      },
      fail: () => {
        wx.showToast({ icon: 'none', title: '提醒授权失败' })
      },
      complete: () => {
        this.setData({ subscribing: false })
      },
    })
  },
})
