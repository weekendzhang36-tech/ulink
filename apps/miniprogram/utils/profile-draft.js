const PROFILE_DRAFT_KEY = 'ulinkProfileDraft'

const defaultIndexes = {
  class: 0,
  college: 0,
  major: 0,
  school: 0,
}

function safeIndex(value) {
  const number = Number(value)

  return Number.isInteger(number) && number >= 0 ? number : 0
}

function normalizeIndexes(indexes = {}) {
  return {
    class: safeIndex(indexes.class),
    college: safeIndex(indexes.college),
    major: safeIndex(indexes.major),
    school: safeIndex(indexes.school),
  }
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function pickProfileDraft(data = {}) {
  return {
    agreedToPolicies: Boolean(data.agreedToPolicies),
    birthday: text(data.birthday),
    genderIndex: safeIndex(data.genderIndex),
    indexes: normalizeIndexes(data.indexes || defaultIndexes),
    phoneAuthMethod: data.phoneAuthMethod === 'sms' ? 'sms' : 'wechat',
    realName: text(data.realName),
    smsPhone: text(data.smsPhone),
  }
}

function saveProfileDraft(storage, data) {
  storage.setStorageSync(PROFILE_DRAFT_KEY, pickProfileDraft(data))
}

function loadProfileDraft(storage) {
  const draft = storage.getStorageSync(PROFILE_DRAFT_KEY)
  if (!draft || typeof draft !== 'object') {
    return null
  }

  return pickProfileDraft(draft)
}

function clearProfileDraft(storage) {
  storage.removeStorageSync(PROFILE_DRAFT_KEY)
}

module.exports = {
  clearProfileDraft,
  loadProfileDraft,
  saveProfileDraft,
}
