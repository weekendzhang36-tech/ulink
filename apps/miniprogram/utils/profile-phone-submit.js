function canSubmitProfilePhone({
  mode,
  originalPhone,
  phone,
  phoneVerificationToken,
  phoneVerified,
}) {
  if (!phoneVerified) return false
  if (mode === 'edit' && originalPhone && phone === originalPhone) return true

  return Boolean(phoneVerificationToken)
}

module.exports = {
  canSubmitProfilePhone,
}
