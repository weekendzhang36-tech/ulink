function getProfileGuardRedirect(error) {
  const message = error && error.message ? error.message : ''
  const statusCode = error && error.statusCode ? error.statusCode : 0

  if (statusCode === 401 || message.includes('请先登录')) {
    return '/pages/login/index'
  }
  if (statusCode === 403 || message.includes('请先完善学生资料')) {
    return '/pages/profile/index'
  }

  return ''
}

module.exports = {
  getProfileGuardRedirect,
}
