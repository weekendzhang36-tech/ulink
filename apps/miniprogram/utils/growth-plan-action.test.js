const assert = require('node:assert/strict')
const test = require('node:test')

const { getGrowthPlanActionState } = require('./growth-plan-action')

test('allows a visitor without membership state to join the growth plan', () => {
  assert.deepEqual(
    getGrowthPlanActionState({
      hasSession: false,
      plan: { id: 'growth-plan-half-year' },
    }),
    {
      disabled: false,
      hintText: '登录后可开通成长计划',
      label: '加入成长计划',
      type: 'join',
    },
  )
})

test('sends an active member to their membership details instead of creating another order', () => {
  assert.deepEqual(
    getGrowthPlanActionState({
      hasSession: true,
      membershipState: {
        expiresText: '有效期至 2027-02-25',
        isActive: true,
        statusText: '生效中',
      },
      plan: { id: 'growth-plan-half-year' },
      profileCompleted: true,
    }),
    {
      disabled: false,
      hintText: '当前成长计划生效中，有效期至 2027-02-25',
      label: '查看我的权益',
      type: 'view_membership',
    },
  )
})

test('asks a logged-in student without a completed profile to finish profile first', () => {
  assert.deepEqual(
    getGrowthPlanActionState({
      hasSession: true,
      membershipState: {
        expiresText: '加入后可查看有效期',
        isActive: false,
        statusText: '未开通',
      },
      plan: { id: 'growth-plan-half-year' },
      profileCompleted: false,
    }),
    {
      disabled: false,
      hintText: '完成学生资料后再开通成长计划',
      label: '先完善学生资料',
      type: 'complete_profile',
    },
  )
})

test('asks a pending student to wait for verification before joining the growth plan', () => {
  assert.deepEqual(
    getGrowthPlanActionState({
      hasSession: true,
      membershipState: {
        expiresText: '加入后可查看有效期',
        isActive: false,
        statusText: '未开通',
      },
      plan: { id: 'growth-plan-half-year' },
      profileCompleted: true,
      verificationStatus: 'pending',
    }),
    {
      disabled: false,
      hintText: '学生认证通过后再开通成长计划',
      label: '查看认证进度',
      type: 'view_verification',
    },
  )
})

test('uses student-facing payment result wording for verified students', () => {
  assert.deepEqual(
    getGrowthPlanActionState({
      hasSession: true,
      membershipState: {
        expiresText: '加入后可查看有效期',
        isActive: false,
        statusText: '未开通',
      },
      plan: { id: 'growth-plan-half-year' },
      profileCompleted: true,
      verificationStatus: 'verified',
    }),
    {
      disabled: false,
      hintText: '点击后拉起微信支付，会员状态以平台支付结果为准',
      label: '加入成长计划',
      type: 'join',
    },
  )
})

test('disables the action while a payment request is loading', () => {
  assert.deepEqual(
    getGrowthPlanActionState({
      hasSession: true,
      loading: true,
      plan: { id: 'growth-plan-half-year' },
      profileCompleted: true,
    }),
    {
      disabled: true,
      hintText: '正在拉起支付，请稍候',
      label: '处理中',
      type: 'loading',
    },
  )
})

test('disables the action when no active plan is configured', () => {
  assert.deepEqual(
    getGrowthPlanActionState({
      hasSession: true,
      plan: null,
      profileCompleted: true,
    }),
    {
      disabled: true,
      hintText: '成长计划暂未开放',
      label: '暂未开放',
      type: 'unavailable',
    },
  )
})
