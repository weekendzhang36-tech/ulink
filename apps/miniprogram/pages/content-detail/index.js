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

  useAction() {
    const article = this.data.article || {}
    if (!article.actionUrl) {
      wx.showToast({ icon: 'none', title: '暂未开放' })
      return
    }

    wx.setClipboardData({
      data: article.actionUrl,
      success() {
        wx.showToast({ title: '链接已复制' })
      },
    })
  },
})
