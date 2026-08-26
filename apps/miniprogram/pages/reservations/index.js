const {
  cancelContentReservation,
  getContentReservations,
  getSessionToken,
} = require('../../utils/api')

function dateText(value) {
  return value ? value.slice(0, 10) : ''
}

function normalizeReservation(reservation) {
  const content = reservation.content || {}

  return {
    ...reservation,
    content,
    reservedDateText: dateText(reservation.reservedAt),
    tagText: Array.isArray(content.tags) ? content.tags.join(' · ') : '',
  }
}

Page({
  data: {
    cancelingId: '',
    loading: true,
    reservations: [],
  },

  onShow() {
    if (!getSessionToken()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }

    this.loadReservations()
  },

  loadReservations() {
    this.setData({ loading: true })
    getContentReservations()
      .then((data) => {
        this.setData({
          reservations: (data.reservations || []).map(normalizeReservation),
        })
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '预约加载失败' })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  openContent(event) {
    const { id } = event.currentTarget.dataset
    if (!id) return

    wx.navigateTo({ url: `/pages/content-detail/index?id=${id}` })
  },

  cancelReservation(event) {
    const { id } = event.currentTarget.dataset
    if (!id || this.data.cancelingId) return

    wx.showModal({
      cancelText: '再想想',
      confirmColor: '#ff3b30',
      confirmText: '取消预约',
      content: '取消后会释放名额，如需参加可以重新预约。',
      title: '取消预约',
      success: (result) => {
        if (!result.confirm) return

        this.setData({ cancelingId: id })
        cancelContentReservation(id)
          .then(() => {
            this.setData({
              reservations: this.data.reservations.filter((reservation) => reservation.id !== id),
            })
            wx.showToast({ icon: 'success', title: '已取消' })
          })
          .catch((error) => {
            wx.showToast({ icon: 'none', title: error.message || '取消失败' })
          })
          .finally(() => {
            this.setData({ cancelingId: '' })
          })
      },
    })
  },
})
