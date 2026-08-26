const { getInstructorVerifications, getSessionToken, reviewInstructorStudents } = require('../../utils/api')

Page({
  data: {
    hasStudents: false,
    loading: false,
    pendingCount: 0,
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
          hasStudents: Boolean(data.students && data.students.length),
          pendingCount: data.pendingCount || 0,
          students: data.students || [],
        })
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '暂无管理权限' })
      })
      .finally(() => {
        this.setData({ loading: false })
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

  reviewStudents(action, studentIds) {
    this.setData({ loading: true })
    reviewInstructorStudents({ action, studentIds })
      .then(() => {
        wx.showToast({ icon: 'success', title: action === 'verified' ? '已确认' : '已标记' })
        this.loadStudents()
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '处理失败' })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },
})
