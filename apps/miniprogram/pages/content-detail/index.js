const { getArticleById, getSessionToken, reserveContent } = require('../../utils/api')
const { getContentActionState } = require('../../utils/content-action')
const { handleProfileGuardError } = require('../../utils/profile-guard')

function withActionState(article) {
  if (!article) return article

  return {
    ...article,
    actionState: getContentActionState(article),
  }
}

Page({
  data: {
    actionLoading: false,
    article: null,
  },

  onLoad(options) {
    getArticleById(options.id)
      .then((article) => {
        this.setData({ article: withActionState(article) })
      })
      .catch((error) => {
        handleProfileGuardError(error, '内容加载失败')
      })
  },

  useAction() {
    const article = this.data.article || {}
    const actionState = article.actionState || getContentActionState(article)

    if (actionState.disabled) {
      wx.showToast({ icon: 'none', title: actionState.hintText || actionState.label })
      return
    }

    if (actionState.type === 'open_membership') {
      wx.navigateTo({ url: '/pages/growth-plan/index' })
      return
    }

    if (actionState.type === 'view_verification') {
      wx.navigateTo({ url: '/pages/verification/index' })
      return
    }

    if (actionState.type === 'reserve') {
      if (!getSessionToken()) {
        wx.navigateTo({ url: '/pages/login/index' })
        return
      }

      this.setData({ actionLoading: true })
      reserveContent(article.id)
        .then((result) => {
          const nextArticle = withActionState({
            ...article,
            ...result.content,
            reservation: result.reservation,
          })
          this.setData({ article: nextArticle })
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

    if (actionState.type === 'unavailable') {
      wx.showToast({ icon: 'none', title: actionState.hintText || '暂未开放' })
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
