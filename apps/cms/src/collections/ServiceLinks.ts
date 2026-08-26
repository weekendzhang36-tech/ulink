import type { CollectionConfig } from 'payload'

export const ServiceLinks: CollectionConfig = {
  slug: 'service-links',
  admin: {
    defaultColumns: ['title', 'module', 'serviceType', 'entryType', 'isActive'],
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
    {
      name: 'entryType',
      type: 'select',
      label: '入口方式',
      required: true,
      defaultValue: 'external_link',
      options: [
        { label: '复制外部链接', value: 'external_link' },
        { label: '跳转第三方小程序', value: 'mini_program' },
        { label: '咨询承接', value: 'consultation' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      label: '外部链接',
      admin: {
        description: '入口方式为“复制外部链接”时填写。',
      },
    },
    {
      name: 'miniProgramAppId',
      type: 'text',
      label: '第三方小程序 AppID',
      admin: {
        description: '入口方式为“跳转第三方小程序”时填写。',
      },
    },
    {
      name: 'miniProgramPath',
      type: 'text',
      label: '第三方小程序路径',
      admin: {
        description: '可选，例如 pages/start/index?source=ulink。',
      },
    },
    {
      name: 'contactHint',
      type: 'textarea',
      label: '咨询承接说明',
      admin: {
        description: '入口方式为“咨询承接”时展示给学生。',
      },
    },
    { name: 'isActive', type: 'checkbox', label: '启用', defaultValue: true },
  ],
}
