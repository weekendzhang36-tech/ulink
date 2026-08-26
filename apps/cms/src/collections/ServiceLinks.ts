import type { CollectionConfig } from 'payload'

export const ServiceLinks: CollectionConfig = {
  slug: 'service-links',
  admin: {
    defaultColumns: ['title', 'module', 'serviceType', 'isActive'],
    group: '服务入口',
    useAsTitle: 'title',
  },
  labels: {
    singular: '服务入口',
    plural: '服务入口',
  },
  fields: [
    { name: 'title', type: 'text', label: '名称', required: true },
    {
      name: 'module',
      type: 'select',
      label: '所属模块',
      required: true,
      defaultValue: 'career_planning',
      options: [
        { label: '职业规划', value: 'career_planning' },
        { label: '实习实践', value: 'practice' },
        { label: '金融底色', value: 'finance_foundation' },
        { label: '文化交流', value: 'culture_exchange' },
      ],
    },
    {
      name: 'serviceType',
      type: 'select',
      label: '服务类型',
      required: true,
      options: [
        { label: '简历服务', value: 'resume' },
        { label: '职业测评', value: 'assessment' },
        { label: '规划咨询', value: 'consulting' },
        { label: '线下空间', value: 'offline_space' },
      ],
    },
    { name: 'description', type: 'textarea', label: '说明' },
    { name: 'url', type: 'text', label: '跳转链接' },
    { name: 'isActive', type: 'checkbox', label: '启用', defaultValue: true },
  ],
}
