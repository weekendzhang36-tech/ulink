function createLocalDevLoginCode(now = new Date()) {
  return `local-dev-login-${now.getTime()}`
}

function shouldUseLocalDevLoginFallback(globalData) {
  return Boolean(globalData && globalData.localDevWechatLoginFallback === true)
}

module.exports = {
  createLocalDevLoginCode,
  shouldUseLocalDevLoginFallback,
}
