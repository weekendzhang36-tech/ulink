function getGrowthPlanActionState({ hasSession, loading = false, membershipState, plan, profileCompleted }) {
  if (loading) {
    return {
      disabled: true,
      hintText: '正在拉起支付，请稍候',
      label: '处理中',
      type: 'loading',
    }
  }

  if (!plan) {
    return {
      disabled: true,
      hintText: '成长计划暂未开放',
      label: '暂未开放',
      type: 'unavailable',
    }
  }

  if (membershipState && membershipState.isActive) {
    return {
      disabled: false,
      hintText: `当前成长计划${membershipState.statusText || '生效中'}，${membershipState.expiresText}`,
      label: '查看我的权益',
      type: 'view_membership',
    }
  }

  if (hasSession && profileCompleted === false) {
    return {
      disabled: false,
      hintText: '完成学生资料后再开通成长计划',
      label: '先完善学生资料',
      type: 'complete_profile',
    }
  }

  return {
    disabled: false,
    hintText: hasSession ? '点击后拉起微信支付，会员状态以后端支付结果为准' : '登录后可开通成长计划',
    label: '加入成长计划',
    type: 'join',
  }
}

module.exports = {
  getGrowthPlanActionState,
}
