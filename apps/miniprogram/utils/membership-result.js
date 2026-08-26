function hasActivatedMembership(result) {
  return Boolean(result && result.order && result.order.status === 'paid' && result.membership)
}

module.exports = {
  hasActivatedMembership,
}
