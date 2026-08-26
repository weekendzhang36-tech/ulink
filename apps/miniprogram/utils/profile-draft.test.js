const assert = require('node:assert/strict')
const test = require('node:test')

const {
  clearProfileDraft,
  loadProfileDraft,
  saveProfileDraft,
} = require('./profile-draft')

function createStorage() {
  const values = new Map()

  return {
    getStorageSync(key) {
      return values.get(key)
    },
    removeStorageSync(key) {
      values.delete(key)
    },
    setStorageSync(key, value) {
      values.set(key, value)
    },
  }
}

test('stores only resumable profile fields in local draft', () => {
  const storage = createStorage()

  saveProfileDraft(storage, {
    agreedToPolicies: true,
    birthday: '2007-09-01',
    genderIndex: 1,
    indexes: {
      class: 3,
      college: 1,
      major: 2,
      school: 0,
    },
    loading: true,
    phone: '13800000001',
    phoneAuthMethod: 'sms',
    phoneVerificationToken: 'signed-token',
    phoneVerified: true,
    realName: '林一诺',
    smsCode: '123456',
    smsCodeSent: true,
    smsPhone: '13800000001',
  })

  assert.deepEqual(loadProfileDraft(storage), {
    agreedToPolicies: true,
    birthday: '2007-09-01',
    genderIndex: 1,
    indexes: {
      class: 3,
      college: 1,
      major: 2,
      school: 0,
    },
    phoneAuthMethod: 'sms',
    realName: '林一诺',
    smsPhone: '13800000001',
  })
})

test('clears profile draft after successful submission', () => {
  const storage = createStorage()
  saveProfileDraft(storage, { realName: '林一诺' })

  clearProfileDraft(storage)

  assert.equal(loadProfileDraft(storage), null)
})
