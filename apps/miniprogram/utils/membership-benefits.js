function normalizeMembershipBenefits(plan) {
  if (!plan || !Array.isArray(plan.benefits)) return []

  return plan.benefits
    .map((item) => (typeof item === 'string' ? item : item && item.text))
    .filter(Boolean)
}

module.exports = {
  normalizeMembershipBenefits,
}
