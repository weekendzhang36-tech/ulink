const { getStudentState } = require('../../utils/api')

Page({
  data: {
    state: null,
  },

  onLoad() {
    getStudentState().then((state) => {
      this.setData({
        avatarText: state.name.slice(0, 1),
        state,
      })
    })
  },

  openVerification() {
    wx.navigateTo({ url: '/pages/verification/index' })
  },
})
