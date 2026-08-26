const assert = require('node:assert/strict')
const test = require('node:test')

const { getOrderActionState } = require('./order-action')

test('allows a pending membership order to be cancelled', () => {
  assert.deepEqual(
    getOrderActionState({
      status: 'pending',
      statusText: '待支付',
    }),
    {
      disabled: false,
      hintText: '30 分钟内未支付会自动关闭，也可以现在取消',
      label: '取消订单',
      type: 'cancel',
    },
  )
})

test('does not allow a paid membership order to be cancelled', () => {
  assert.deepEqual(
    getOrderActionState({
      status: 'paid',
      statusText: '已支付',
    }),
    {
      disabled: true,
      hintText: '会员权益以后台支付结果为准',
      label: '已完成',
      type: 'paid',
    },
  )
})

test('shows terminal order statuses as read-only', () => {
  assert.deepEqual(
    getOrderActionState({
      status: 'closed',
      statusText: '已关闭',
    }),
    {
      disabled: true,
      hintText: '该订单已结束，如需加入可重新下单',
      label: '已关闭',
      type: 'closed',
    },
  )

  assert.deepEqual(
    getOrderActionState({
      status: 'cancelled',
      statusText: '已取消',
    }),
    {
      disabled: true,
      hintText: '该订单已结束，如需加入可重新下单',
      label: '已取消',
      type: 'cancelled',
    },
  )
})
