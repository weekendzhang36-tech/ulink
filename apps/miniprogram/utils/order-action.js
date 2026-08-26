const TERMINAL_HINT = '该订单已结束，如需加入可重新下单'

function getOrderActionState(order = {}) {
  if (order.status === 'pending') {
    return {
      hintText: '30 分钟内未支付会自动关闭，也可以现在取消',
      primaryAction: {
        disabled: false,
        label: '继续支付',
        type: 'pay',
      },
      secondaryAction: {
        disabled: false,
        label: '取消订单',
        type: 'cancel',
      },
      type: 'pending',
    }
  }

  if (order.status === 'paid') {
    return {
      disabled: true,
      hintText: '会员权益以支付完成状态为准',
      label: '已完成',
      type: 'paid',
    }
  }

  if (order.status === 'cancelled') {
    return {
      disabled: true,
      hintText: TERMINAL_HINT,
      label: '已取消',
      type: 'cancelled',
    }
  }

  if (order.status === 'closed') {
    return {
      disabled: true,
      hintText: TERMINAL_HINT,
      label: '已关闭',
      type: 'closed',
    }
  }

  if (order.status === 'failed') {
    return {
      disabled: true,
      hintText: TERMINAL_HINT,
      label: '支付失败',
      type: 'failed',
    }
  }

  return {
    disabled: true,
    hintText: order.statusText || '订单状态待确认',
    label: order.statusText || '状态待确认',
    type: 'unknown',
  }
}

module.exports = {
  getOrderActionState,
}
