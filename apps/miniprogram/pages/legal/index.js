const { getLegalDocument, listLegalDocuments } = require('../../utils/legal-documents')

function toViewDocument(type) {
  const document = getLegalDocument(type)
  if (!document) return null

  return {
    ...document,
    paragraphs: document.body.split('\n\n'),
    type,
  }
}

Page({
  data: {
    document: null,
    documents: [],
    showList: false,
  },

  onLoad(options) {
    const document = toViewDocument(options.type)
    if (document) {
      wx.setNavigationBarTitle({ title: document.title })
      this.setData({ document, showList: false })
      return
    }

    this.setData({
      documents: listLegalDocuments(),
      showList: true,
    })
  },

  openDocument(event) {
    const { type } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/legal/index?type=${type}` })
  },
})
