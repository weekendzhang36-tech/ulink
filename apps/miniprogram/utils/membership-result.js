function hasActivatedMembership(result) {
  return Boolean(
    result &&
      result.order &&
      result.order.status === 'paid' &&
      (result.membership || (result.membershipState && result.membershipState.isActive)),
  )
}

module.exports = {
  hasActivatedMembership,
}
