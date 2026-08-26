const { getContentsByModule, getServiceLinksByModule } = require('../../utils/api')
const { handleProfileGuardError } = require('../../utils/profile-guard')
const { getServiceLinkAction } = require('../../utils/service-link-action')

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
        handleProfileGuardError(error, '内容加载失败')
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
    const action = getServiceLinkAction(service)
    if (action.type === 'copy_link') {
      wx.setClipboardData({
        data: action.data,
        success() {
          wx.showToast({ title: action.toastText })
        },
      })
      return
    }
    if (action.type === 'mini_program') {
      wx.navigateToMiniProgram({
        appId: action.appId,
        path: action.path,
        fail() {
          wx.showToast({ icon: 'none', title: '暂时无法打开' })
        },
      })
      return
    }
    if (action.type === 'consultation') {
      wx.showModal({
        confirmText: '知道了',
        content: action.content,
        showCancel: false,
        title: action.title,
      })
      return
    }

    wx.showToast({ icon: 'none', title: action.title })
  },
})
