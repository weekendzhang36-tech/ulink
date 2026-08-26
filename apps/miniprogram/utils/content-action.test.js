const assert = require('node:assert/strict')
const test = require('node:test')

const { getContentActionState } = require('./content-action')

test('routes locked member-only content to the growth plan', () => {
  assert.deepEqual(
    getContentActionState({
      actionLabel: '开通成长计划',
      isLocked: true,
    }),
    {
      disabled: false,
      hintText: '开通后可查看完整内容和报名入口',
      label: '开通成长计划',
      type: 'open_membership',
    },
  )
})

test('uses configured external action link when present', () => {
  assert.deepEqual(
    getContentActionState({
      actionLabel: '查看报名链接',
      actionUrl: 'https://example.com/apply',
      status: 'open',
    }),
    {
      disabled: false,
      hintText: '点击后复制链接，在微信内打开或转发给自己继续操作',
      label: '查看报名链接',
      type: 'copy_link',
    },
  )
})

test('shows reserved content as disabled reserved action', () => {
  assert.deepEqual(
    getContentActionState({
      actionLabel: '预约报名',
      reservation: {
        status: 'reserved',
        statusText: '已预约',
      },
      status: 'open',
    }),
    {
      disabled: true,
      hintText: '你已预约，后续可在“我的预约”中查看',
      label: '已预约',
      type: 'reserved',
    },
  )
})

test('blocks closed content before reservation action', () => {
  assert.deepEqual(
    getContentActionState({
      actionLabel: '预约报名',
      capacityText: '50 人已预约 · 剩余 0 个名额',
      status: 'closed',
      statusText: '已结束',
    }),
    {
      disabled: true,
      hintText: '已结束',
      label: '已结束',
      type: 'unavailable',
    },
  )
})

test('blocks full content before reservation action', () => {
  assert.deepEqual(
    getContentActionState({
      actionLabel: '预约报名',
      capacityText: '50 人已预约 · 剩余 0 个名额',
      status: 'open',
      statusText: '报名中',
    }),
    {
      disabled: true,
      hintText: '50 人已预约 · 剩余 0 个名额',
      label: '名额已满',
      type: 'unavailable',
    },
  )
})

test('uses reservation action for open own content without external link', () => {
  assert.deepEqual(
    getContentActionState({
      actionLabel: '预约报名',
      status: 'open',
    }),
    {
      disabled: false,
      hintText: '点击后提交预约，结果以后台记录为准',
      label: '预约报名',
      type: 'reserve',
    },
  )
})

test('shows unavailable state when no action is configured', () => {
  assert.deepEqual(
    getContentActionState({
      status: 'open',
      statusText: '报名中',
    }),
    {
      disabled: true,
      hintText: '当前内容暂未配置报名或服务入口',
      label: '暂未开放',
      type: 'unavailable',
    },
  )
})
