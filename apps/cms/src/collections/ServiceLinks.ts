import type { CollectionConfig } from 'payload'

export const ServiceLinks: CollectionConfig = {
  slug: 'service-links',
  admin: {
    defaultColumns: ['title', 'serviceType', 'isActive'],
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
