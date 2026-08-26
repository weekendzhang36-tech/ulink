const { getContentsByModule } = require('../../utils/api')

Page({
  data: {
    contentEmpty: false,
    contents: [],
    loading: true,
    moduleKey: '',
    title: '成长模块',
  },

  onLoad(options) {
    const moduleKey = options.module || ''
    const title = options.title || '成长模块'
    this.setData({ moduleKey, title })
    wx.setNavigationBarTitle({ title })

    getContentsByModule(moduleKey)
      .then((contents) => {
        this.setData({
          contentEmpty: contents.length === 0,
          contents,
        })
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '内容加载失败' })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  openContent(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/content-detail/index?id=${id}` })
  },
})
