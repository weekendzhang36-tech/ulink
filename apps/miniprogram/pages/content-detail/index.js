const { getArticleById } = require('../../utils/api')

Page({
  data: {
    article: null,
  },

  onLoad(options) {
    getArticleById(options.id)
      .then((article) => {
        this.setData({ article })
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '内容加载失败' })
      })
  },
})
