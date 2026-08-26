import type { CollectionConfig } from 'payload'

export const GrowthPlans: CollectionConfig = {
  slug: 'growth-plans',
  admin: {
    defaultColumns: ['title', 'priceCents', 'durationDays', 'isActive'],
    group: '会员与订单',
    useAsTitle: 'title',
  },
  labels: {
    singular: '成长计划',
    plural: '成长计划',
  },
  fields: [
    { name: 'title', type: 'text', label: '计划名称', required: true },
    { name: 'priceCents', type: 'number', label: '价格（分）', required: true, defaultValue: 500 },
    { name: 'durationDays', type: 'number', label: '有效期天数', required: true, defaultValue: 183 },
    { name: 'description', type: 'textarea', label: '说明' },
    {
      name: 'benefits',
      type: 'array',
      label: '权益',
      fields: [{ name: 'text', type: 'text', label: '权益说明', required: true }],
    },
    { name: 'isActive', type: 'checkbox', label: '启用', defaultValue: true },
  ],
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    defaultColumns: ['orderNo', 'student', 'growthPlan', 'status', 'amountCents'],
    group: '会员与订单',
    useAsTitle: 'orderNo',
  },
  labels: {
    singular: '订单',
    plural: '订单',
  },
  fields: [
    { name: 'orderNo', type: 'text', label: '订单号', required: true, unique: true },
    { name: 'student', type: 'relationship', label: '学生', relationTo: 'students', required: true },
    { name: 'growthPlan', type: 'relationship', label: '成长计划', relationTo: 'growth-plans', required: true },
    { name: 'amountCents', type: 'number', label: '金额（分）', required: true },
    {
      name: 'status',
      type: 'select',
      label: '订单状态',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: '待支付', value: 'pending' },
        { label: '已支付', value: 'paid' },
        { label: '已取消', value: 'cancelled' },
        { label: '已关闭', value: 'closed' },
        { label: '支付失败', value: 'failed' },
      ],
    },
    { name: 'paidAt', type: 'date', label: '支付时间' },
    { name: 'wechatTransactionId', type: 'text', label: '微信支付交易号' },
  ],
}

export const Memberships: CollectionConfig = {
  slug: 'memberships',
  admin: {
    defaultColumns: ['student', 'growthPlan', 'status', 'expiresAt'],
    group: '会员与订单',
    useAsTitle: 'student',
  },
  labels: {
    singular: '会员状态',
    plural: '会员状态',
  },
  fields: [
    { name: 'student', type: 'relationship', label: '学生', relationTo: 'students', required: true },
    { name: 'growthPlan', type: 'relationship', label: '成长计划', relationTo: 'growth-plans', required: true },
    {
      name: 'status',
      type: 'select',
      label: '会员状态',
      defaultValue: 'active',
      required: true,
      options: [
        { label: '生效中', value: 'active' },
        { label: '已过期', value: 'expired' },
        { label: '已取消', value: 'cancelled' },
      ],
    },
    { name: 'startedAt', type: 'date', label: '开始时间', required: true },
    { name: 'expiresAt', type: 'date', label: '到期时间', required: true },
    { name: 'sourceOrder', type: 'relationship', label: '来源订单', relationTo: 'orders', required: true },
  ],
}

export const PaymentEvents: CollectionConfig = {
  slug: 'payment-events',
  admin: {
    defaultColumns: ['eventKey', 'order', 'status', 'processedAt'],
    group: '会员与订单',
    useAsTitle: 'eventKey',
  },
  labels: {
    singular: '支付事件',
    plural: '支付事件',
  },
  fields: [
    { name: 'eventKey', type: 'text', label: '事件唯一键', required: true, unique: true },
    { name: 'order', type: 'relationship', label: '订单', relationTo: 'orders', required: true },
    {
      name: 'status',
      type: 'select',
      label: '支付状态',
      defaultValue: 'paid',
      required: true,
      options: [
        { label: '已支付', value: 'paid' },
        { label: '支付失败', value: 'failed' },
      ],
    },
    { name: 'transactionId', type: 'text', label: '微信支付交易号' },
    { name: 'processedAt', type: 'date', label: '处理时间', required: true },
    { name: 'rawPayload', type: 'json', label: '原始回调内容' },
  ],
}
