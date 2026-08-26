const { getContentsByModule, getServiceLinksByModule } = require('../../utils/api')

Page({
  data: {
    contentEmpty: false,
    contents: [],
    loading: true,
    moduleKey: '',
    serviceLinks: [],
    servicesEmpty: true,
    title: '成长模块',
  },

  onLoad(options) {
    const moduleKey = options.module || ''
    const title = options.title || '成长模块'
    this.setData({ moduleKey, title })
    wx.setNavigationBarTitle({ title })

    Promise.all([getContentsByModule(moduleKey), getServiceLinksByModule(moduleKey)])
      .then(([contents, serviceLinks]) => {
        this.setData({
          contentEmpty: contents.length === 0,
          contents,
          serviceLinks,
          servicesEmpty: serviceLinks.length === 0,
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

  openService(event) {
    const { id } = event.currentTarget.dataset
    const service = this.data.serviceLinks.find((item) => item.id === id)
    if (!service || !service.url) {
      wx.showToast({ icon: 'none', title: '暂未开放' })
      return
    }

    wx.setClipboardData({
      data: service.url,
      success() {
        wx.showToast({ title: '链接已复制' })
      },
    })
  },
})
