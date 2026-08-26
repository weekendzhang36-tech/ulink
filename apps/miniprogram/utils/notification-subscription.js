const purposeTemplateKeys = {
  instructor_pending_verification: 'instructorPendingVerification',
  student_verification_result: 'studentVerificationResult',
}

function getTemplateIdForPurpose(app, purpose) {
  const key = purposeTemplateKeys[purpose]
  const templates = (app && app.globalData && app.globalData.subscriptionTemplates) || {}

  return key ? templates[key] || '' : ''
}

function shouldRecordSubscribeResult(result, templateId) {
  return Boolean(result && templateId && result[templateId] === 'accept')
}

module.exports = {
  getTemplateIdForPurpose,
  shouldRecordSubscribeResult,
}
