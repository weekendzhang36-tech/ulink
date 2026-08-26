function getProfileSubmitSuccessUrl(mode) {
  return mode === 'edit' ? '/pages/verification/index' : '/pages/profile-submitted/index'
}

function buildSubmittedProfileSummary(state = {}) {
  return [
    { label: '姓名', value: state.name || '已提交' },
    { label: '学校', value: state.school || '已选择' },
    { label: '班级', value: state.className || '已选择' },
    { label: '状态', value: state.verificationStatus || '待认证' },
  ]
}

module.exports = {
  buildSubmittedProfileSummary,
  getProfileSubmitSuccessUrl,
}
