const { getCampusOptions, submitProfile, verifyWechatPhone } = require('../../utils/api')

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '不透露', value: 'undisclosed' },
]

function selectedLabel(list, index, fallback) {
  const item = list[index]

  return item ? item.name : fallback
}

function buildSelectedLabels(campus, indexes) {
  return {
    class: selectedLabel(campus.classes, indexes.class, '请选择班级'),
    college: selectedLabel(campus.colleges, indexes.college, '请选择学院'),
    major: selectedLabel(campus.majors, indexes.major, '请选择专业'),
    school: selectedLabel(campus.schools, indexes.school, '请选择学校'),
  }
}

Page({
  data: {
    agreedToPolicies: false,
    birthday: '',
    campus: { classes: [], colleges: [], majors: [], schools: [] },
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
    phoneVerificationToken: '',
    phoneVerified: false,
    realName: '',
    selectedLabels: {
      class: '请选择班级',
      college: '请选择学院',
      major: '请选择专业',
      school: '请选择学校',
    },
  },

  onLoad() {
    getCampusOptions()
      .then((campus) => {
        this.setData({
          campus,
          selectedLabels: buildSelectedLabels(campus, this.data.indexes),
        })
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '学校数据加载失败' })
      })
  },

  changeAgreed(event) {
    this.setData({ agreedToPolicies: event.detail.value.length > 0 })
  },

  changeBirthday(event) {
    this.setData({ birthday: event.detail.value })
  },

  changeGender(event) {
    this.setData({ genderIndex: Number(event.detail.value) })
  },

  changePicker(event) {
    const key = event.currentTarget.dataset.key
    const indexes = {
      ...this.data.indexes,
      [key]: Number(event.detail.value),
    }
    this.setData({
      indexes,
      selectedLabels: buildSelectedLabels(this.data.campus, indexes),
    })
  },

  changeText(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ [key]: event.detail.value })
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
        wx.showToast({ title: '手机号已授权' })
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '手机号授权失败' })
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
    if (!phoneVerified || !phoneVerificationToken) {
      wx.showToast({ icon: 'none', title: '请先授权手机号' })
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
        wx.switchTab({ url: '/pages/home/index' })
      })
      .catch((error) => {
        wx.showToast({ icon: 'none', title: error.message || '提交失败' })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },
})
