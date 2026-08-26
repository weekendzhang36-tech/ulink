const { getContentReservations, getSessionToken } = require('../../utils/api')

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
})
