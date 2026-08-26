const {
  getCampusOptions,
  getSubmittedProfile,
  requestSmsPhone,
  submitProfile,
  verifySmsPhone,
  verifyWechatPhone,
} = require('../../utils/api')
const {
  clearProfileDraft,
  loadProfileDraft,
  saveProfileDraft,
} = require('../../utils/profile-draft')
const { canSubmitProfilePhone } = require('../../utils/profile-phone-submit')
const {
  buildCampusSelection,
  emptyCampus,
  fallbackLabels,
  findCampusIndexesByIds,
  updateCampusSelection,
} = require('../../utils/campus-selection')
const { handleProfileGuardError } = require('../../utils/profile-guard')
const { getProfileSubmitSuccessUrl } = require('../../utils/profile-submission-success')

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '不透露', value: 'undisclosed' },
]

function mergeDraft(baseData, draft) {
  if (!draft) return baseData

  return {
    ...baseData,
    agreedToPolicies: draft.agreedToPolicies,
    birthday: draft.birthday,
    genderIndex: draft.genderIndex,
    indexes: draft.indexes,
    phoneAuthMethod: draft.phoneAuthMethod,
    realName: draft.realName,
    smsPhone: draft.smsPhone,
  }
}

Page({
  data: {
    agreedToPolicies: false,
    birthday: '',
    allCampus: emptyCampus,
    campus: emptyCampus,
    genderIndex: 0,
    genderOptions,
    indexes: {
      class: 0,
      college: 0,
      major: 0,
      school: 0,
    },
    loading: false,
    phone: '',
    phoneAuthMethod: 'wechat',
    phoneVerificationToken: '',
    phoneVerified: false,
    originalPhone: '',
    realName: '',
    selectedLabels: fallbackLabels,
    smsCode: '',
    smsCodeSent: false,
    smsPhone: '',
    mode: 'create',
  },

  onLoad(options = {}) {
    const mode = options.edit === '1' ? 'edit' : 'create'
    this.setData({ mode })
    const draft = loadProfileDraft(wx)
    if (draft && mode !== 'edit') {
      this.setData(mergeDraft(this.data, draft))
    }

    getCampusOptions()
      .then((allCampus) => {
        if (mode === 'edit') {
          return getSubmittedProfile()
            .then((data) => {
              const profile = data.profile || {}
              const indexes = findCampusIndexesByIds(allCampus, profile)
              const selection = buildCampusSelection(allCampus, indexes)
              const genderIndex = Math.max(
                0,
                genderOptions.findIndex((option) => option.value === profile.gender),
              )
              this.setData({
                allCampus,
                agreedToPolicies: true,
                birthday: profile.birthday || '',
                genderIndex,
                phone: profile.phone || '',
                phoneAuthMethod: 'wechat',
                phoneVerificationToken: '',
                phoneVerified: Boolean(profile.phone),
                originalPhone: profile.phone || '',
                realName: profile.realName || '',
                smsPhone: profile.phone || '',
                ...selection,
              })
            })
        }

        const selection = buildCampusSelection(allCampus, this.data.indexes)
        this.setData({ allCampus, ...selection })
      })
      .catch((error) => {
        handleProfileGuardError(error, '资料加载失败')
      })
  },

  changeAgreed(event) {
    this.setData({ agreedToPolicies: event.detail.value.length > 0 })
    this.saveDraft()
  },

  changeBirthday(event) {
    this.setData({ birthday: event.detail.value })
    this.saveDraft()
  },

  changeGender(event) {
    this.setData({ genderIndex: Number(event.detail.value) })
    this.saveDraft()
  },

  changePicker(event) {
    const key = event.currentTarget.dataset.key
    this.setData({
      ...updateCampusSelection(this.data.allCampus, this.data.indexes, key, event.detail.value),
    })
    this.saveDraft()
  },

  changeText(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ [key]: event.detail.value })
    this.saveDraft()
  },

  changePhoneAuthMethod(event) {
    const method = event.currentTarget.dataset.method
    if (method === this.data.phoneAuthMethod) return

    this.setData({
      phone: '',
      phoneAuthMethod: method,
      phoneVerificationToken: '',
      phoneVerified: false,
      smsCode: '',
      smsCodeSent: false,
      smsPhone: '',
    })
    this.saveDraft()
  },

  getWechatPhone(event) {
    const phoneCode = event.detail && event.detail.code
    if (!phoneCode) {
      wx.showToast({ icon: 'none', title: '请先授权手机号' })
      return
    }

    this.setData({ loading: true })
    verifyWechatPhone(phoneCode)
      .then((result) => {
        this.setData({
          phone: result.phone,
          phoneVerificationToken: result.phoneVerificationToken,
          phoneVerified: true,
        })
        this.saveDraft()
        wx.showToast({ title: '手机号已授权' })
      })
      .catch((error) => {
        handleProfileGuardError(error, '手机号授权失败')
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  requestSmsCode() {
    const smsPhone = this.data.smsPhone.trim()
    if (!smsPhone) {
      wx.showToast({ icon: 'none', title: '请输入手机号' })
      return
    }

    this.setData({ loading: true })
    requestSmsPhone(smsPhone)
      .then(() => {
        this.setData({ smsCodeSent: true })
        this.saveDraft()
        wx.showToast({ title: '验证码已发送' })
      })
      .catch((error) => {
        handleProfileGuardError(error, '验证码发送失败')
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  verifySmsCode() {
    const smsCode = this.data.smsCode.trim()
    const smsPhone = this.data.smsPhone.trim()
    if (!smsPhone || !smsCode) {
      wx.showToast({ icon: 'none', title: '请填写手机号和验证码' })
      return
    }

    this.setData({ loading: true })
    verifySmsPhone({ phone: smsPhone, smsCode })
      .then((result) => {
        this.setData({
          phone: result.phone,
          phoneVerificationToken: result.phoneVerificationToken,
          phoneVerified: true,
        })
        this.saveDraft()
        wx.showToast({ title: '手机号已验证' })
      })
      .catch((error) => {
        handleProfileGuardError(error, '手机号验证失败')
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  submit() {
    const {
      agreedToPolicies,
      birthday,
      campus,
      genderIndex,
      genderOptions,
      indexes,
      mode,
      originalPhone,
      phone,
      phoneVerificationToken,
      phoneVerified,
      realName,
    } = this.data
    const school = campus.schools[indexes.school]
    const college = campus.colleges[indexes.college]
    const major = campus.majors[indexes.major]
    const classInfo = campus.classes[indexes.class]
    if (!school || !college || !major || !classInfo) {
      wx.showToast({ icon: 'none', title: '请先在后台配置学校数据' })
      return
    }
    if (
      !canSubmitProfilePhone({
        mode,
        originalPhone,
        phone,
        phoneVerificationToken,
        phoneVerified,
      })
    ) {
      wx.showToast({ icon: 'none', title: '请先完成手机号认证' })
      return
    }

    this.setData({ loading: true })
    submitProfile({
      agreedToPolicies,
      birthday,
      classId: classInfo.id,
      collegeId: college.id,
      gender: genderOptions[genderIndex].value,
      majorId: major.id,
      phone,
      phoneVerificationToken,
      realName,
      schoolId: school.id,
    })
      .then(() => {
        clearProfileDraft(wx)
        wx.redirectTo({ url: getProfileSubmitSuccessUrl(mode) })
      })
      .catch((error) => {
        handleProfileGuardError(error, '提交失败')
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  openUserAgreement() {
    wx.navigateTo({ url: '/pages/legal/index?type=user-agreement' })
  },

  openPrivacyPolicy() {
    wx.navigateTo({ url: '/pages/legal/index?type=privacy-policy' })
  },

  saveDraft() {
    saveProfileDraft(wx, this.data)
  },
})
