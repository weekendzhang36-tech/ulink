function hasNoRemainingSeats(article) {
  const capacityText = article && article.capacityText ? article.capacityText : ''

  return /剩余\s*0\s*个名额/.test(capacityText)
}

function unavailableState(label, hintText) {
  return {
    disabled: true,
    hintText,
    label,
    type: 'unavailable',
  }
}

function getContentActionState(article = {}) {
  if (article.isLocked) {
    return {
      disabled: false,
      hintText: '开通后可查看完整内容和报名入口',
      label: article.actionLabel || '开通成长计划',
      type: 'open_membership',
    }
  }

  if (article.reservation && article.reservation.status === 'reserved') {
    return {
      disabled: true,
      hintText: '你已预约，后续可在“我的预约”中查看',
      label: article.reservation.statusText || '已预约',
      type: 'reserved',
    }
  }

  if (article.requiresVerification) {
    return {
      disabled: false,
      hintText: article.verificationMessage || '学生认证通过后再预约成长服务',
      label: article.actionLabel || '查看认证进度',
      type: 'view_verification',
    }
  }

  if (article.status && article.status !== 'open') {
    const label = article.statusText || '暂未开放'

    return unavailableState(label, label)
  }

  if (hasNoRemainingSeats(article)) {
    return unavailableState('名额已满', article.capacityText)
  }

  if (article.actionUrl) {
    return {
      disabled: false,
      hintText: '点击后复制链接，在微信内打开或转发给自己继续操作',
      label: article.actionLabel || '查看链接',
      type: 'copy_link',
    }
  }

  if (article.actionLabel) {
    return {
      disabled: false,
      hintText: '点击后提交预约，结果以平台记录为准',
      label: article.actionLabel,
      type: 'reserve',
    }
  }

  return unavailableState('暂未开放', '当前内容暂未配置报名或服务入口')
}

module.exports = {
  getContentActionState,
}
