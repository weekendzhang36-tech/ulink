const assert = require('node:assert/strict')
const test = require('node:test')

const { normalizeMembershipBenefits } = require('./membership-benefits')

test('normalizes configured growth plan benefits for display', () => {
  assert.deepEqual(
    normalizeMembershipBenefits({
      benefits: [
        '接收实习邀请和报名提醒',
        { text: '获得金融沙龙和财商课优先通知' },
        { text: '' },
        null,
      ],
    }),
    ['接收实习邀请和报名提醒', '获得金融沙龙和财商课优先通知'],
  )
})

test('returns an empty benefit list when no growth plan is configured', () => {
  assert.deepEqual(normalizeMembershipBenefits(null), [])
})
