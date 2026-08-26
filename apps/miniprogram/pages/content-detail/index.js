const { getArticleById, getSessionToken, reserveContent } = require('../../utils/api')
const { handleProfileGuardError } = require('../../utils/profile-guard')

Page({
  data: {
    actionLoading: false,
    article: null,
  },

  onLoad(options) {
    getArticleById(options.id)
      .then((article) => {
        this.setData({ article })
      })
      .catch((error) => {
        handleProfileGuardError(error, '内容加载失败')
      })
  },

  useAction() {
    const article = this.data.article || {}
    if (article.isLocked) {
      wx.navigateTo({ url: '/pages/growth-plan/index' })
      return
    }

    if (!article.actionUrl) {
      if (!getSessionToken()) {
        wx.navigateTo({ url: '/pages/login/index' })
        return
      }
      if (article.reservation) {
        wx.showToast({ icon: 'none', title: '已预约' })
        return
      }

      this.setData({ actionLoading: true })
      reserveContent(article.id)
        .then((result) => {
          this.setData({
            article: {
              ...article,
              ...result.content,
              reservation: result.reservation,
            },
          })
          wx.showToast({ icon: 'success', title: result.alreadyReserved ? '已预约' : '预约成功' })
        })
        .catch((error) => {
          handleProfileGuardError(error, '预约失败')
        })
        .finally(() => {
          this.setData({ actionLoading: false })
        })
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
