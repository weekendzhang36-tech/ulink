const { getArticleById } = require('../../utils/api')

Page({
  data: {
    article: null,
  },

  onLoad(options) {
    getArticleById(options.id).then((article) => {
      this.setData({ article })
    })
  },
})
