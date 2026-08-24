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
