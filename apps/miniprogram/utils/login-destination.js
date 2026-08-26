const homeDestination = {
  method: 'switchTab',
  url: '/pages/home/index',
}

const profileDestination = {
  method: 'redirectTo',
  url: '/pages/profile/index',
}

function getExistingSessionDestination(status) {
  if (!status) return undefined

  return status.profileCompleted ? homeDestination : profileDestination
}

function getLoginResultDestination(result = {}) {
  return result.profileCompleted ? homeDestination : profileDestination
}

module.exports = {
  getExistingSessionDestination,
  getLoginResultDestination,
}
