const { getStudentState } = require('../../utils/api')

Page({
  data: {
    state: null,
  },

  onLoad() {
    getStudentState().then((state) => {
      this.setData({ state })
    })
  },
})
