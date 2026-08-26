const assert = require('node:assert/strict')
const test = require('node:test')

const { hasActivatedMembership } = require('./membership-result')

test('treats paid order with membership as activated membership', () => {
  assert.equal(
    hasActivatedMembership({
      membership: { id: 'membership_001', status: 'active' },
      order: { orderNo: 'order_001', status: 'paid' },
    }),
    true,
  )
})

test('treats paid order with active membership state as activated membership', () => {
  assert.equal(
    hasActivatedMembership({
      membershipState: {
        isActive: true,
        statusText: '生效中',
      },
      order: { orderNo: 'order_001', status: 'paid' },
    }),
    true,
  )
})

test('does not treat paid order without membership as activated membership', () => {
  assert.equal(
    hasActivatedMembership({
      order: { orderNo: 'order_001', status: 'paid' },
    }),
    false,
  )
})
