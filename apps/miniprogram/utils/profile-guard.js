function getProfileGuardRedirect(error) {
  const message = error && error.message ? error.message : ''
  const statusCode = error && error.statusCode ? error.statusCode : 0

  if (statusCode === 401 || message.includes('请先登录')) {
    return '/pages/login/index'
  }
  if (message.includes('请先完善学生资料')) {
    return '/pages/profile/index'
  }

  return ''
}

function getProfileGuardAction(error, fallbackTitle) {
  const redirectUrl = getProfileGuardRedirect(error)
  if (redirectUrl) {
    return {
      type: 'redirect',
      url: redirectUrl,
    }
  }

  const message = error && error.message ? error.message : ''

  return {
    title: message || fallbackTitle,
    type: 'toast',
  }
}

function handleProfileGuardError(error, fallbackTitle) {
  const action = getProfileGuardAction(error, fallbackTitle)

  if (action.type === 'redirect') {
    wx.navigateTo({ url: action.url })
    return true
  }

  wx.showToast({ icon: 'none', title: action.title })
  return false
}

module.exports = {
  getProfileGuardAction,
  getProfileGuardRedirect,
  handleProfileGuardError,
}
