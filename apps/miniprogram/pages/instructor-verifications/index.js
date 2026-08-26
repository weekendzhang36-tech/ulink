const {
  confirmInstructorDataUseCommitment,
  getInstructorVerifications,
  getSessionToken,
  recordNotificationSubscription,
  reviewInstructorStudents,
} = require('../../utils/api')
const {
  getTemplateIdForPurpose,
  shouldRecordSubscribeResult,
} = require('../../utils/notification-subscription')
const { handleProfileGuardError } = require('../../utils/profile-guard')

Page({
  data: {
    hasStudents: false,
    commitmentRequired: false,
    confirmingCommitment: false,
    loading: false,
    pendingCount: 0,
    subscribing: false,
    students: [],
  },

  onShow() {
    if (!getSessionToken()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }

    this.loadStudents()
  },

  loadStudents() {
    this.setData({ loading: true })
    getInstructorVerifications('pending')
      .then((data) => {
        this.setData({
          commitmentRequired: false,
          hasStudents: Boolean(data.students && data.students.length),
          pendingCount: data.pendingCount || 0,
          students: data.students || [],
        })
      })
      .catch((error) => {
        if (error.statusCode === 428 || (error.message || '').includes('数据使用承诺')) {
          this.setData({
            commitmentRequired: true,
            hasStudents: false,
            pendingCount: 0,
            students: [],
          })
          return
        }

        handleProfileGuardError(error, '暂无管理权限')
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  confirmDataUseCommitment() {
    this.setData({ confirmingCommitment: true })
    confirmInstructorDataUseCommitment()
      .then(() => {
        wx.showToast({ title: '已确认' })
        this.setData({ commitmentRequired: false })
        this.loadStudents()
      })
      .catch((error) => {
        handleProfileGuardError(error, '确认失败')
      })
      .finally(() => {
        this.setData({ confirmingCommitment: false })
      })
  },

  reviewOne(event) {
    const { action, id } = event.currentTarget.dataset
    this.reviewStudents(action, [id])
  },

  verifyAll() {
    const studentIds = this.data.students.map((student) => student.id)
    if (studentIds.length === 0) {
      wx.showToast({ icon: 'none', title: '暂无待认证学生' })
      return
    }

    this.reviewStudents('verified', studentIds)
  },

  subscribePendingVerification() {
    if (this.data.commitmentRequired) {
      wx.showToast({ icon: 'none', title: '请先确认承诺' })
      return
    }

    const purpose = 'instructor_pending_verification'
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
            handleProfileGuardError(error, '开启提醒失败')
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

  reviewStudents(action, studentIds) {
    if (this.data.commitmentRequired) {
      wx.showToast({ icon: 'none', title: '请先确认承诺' })
      return
    }

    this.setData({ loading: true })
    reviewInstructorStudents({ action, studentIds })
      .then(() => {
        wx.showToast({ icon: 'success', title: action === 'verified' ? '已确认' : '已标记' })
        this.loadStudents()
      })
      .catch((error) => {
        handleProfileGuardError(error, '处理失败')
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },
})
