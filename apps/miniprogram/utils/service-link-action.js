function getServiceLinkAction(service = {}) {
  const label = service.actionLabel || '查看详情'
  if (service.entryType === 'mini_program') {
    if (!service.miniProgramAppId) {
      return {
        label: '暂未开放',
        title: '暂未开放',
        type: 'unavailable',
      }
    }

    return {
      appId: service.miniProgramAppId,
      label,
      path: service.miniProgramPath || '',
      type: 'mini_program',
    }
  }

  if (service.entryType === 'consultation') {
    return {
      content: service.contactHint || '请稍后联系 U Link 顾问确认服务开放方式。',
      label,
      title: label,
      type: 'consultation',
    }
  }

  if (service.url) {
    return {
      data: service.url,
      label,
      toastText: '链接已复制',
      type: 'copy_link',
    }
  }

  return {
    label: '暂未开放',
    title: '暂未开放',
    type: 'unavailable',
  }
}

module.exports = {
  getServiceLinkAction,
}
