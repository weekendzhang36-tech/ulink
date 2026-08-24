import type { CollectionConfig } from 'payload'

export const ContentCategories: CollectionConfig = {
  slug: 'content-categories',
  admin: {
    defaultColumns: ['title', 'module', 'sortOrder', 'isActive'],
    group: '内容运营',
    useAsTitle: 'title',
  },
  labels: {
    singular: '内容分类',
    plural: '内容分类',
  },
  fields: [
    { name: 'title', type: 'text', label: '分类名称', required: true },
    {
      name: 'module',
      type: 'select',
      label: '所属模块',
      required: true,
      options: [
        { label: '职业规划', value: 'career_planning' },
        { label: '实习实践', value: 'practice' },
        { label: '金融底色', value: 'finance_foundation' },
        { label: '文化交流', value: 'culture_exchange' },
      ],
    },
    { name: 'sortOrder', type: 'number', label: '排序', defaultValue: 100 },
    { name: 'isActive', type: 'checkbox', label: '启用', defaultValue: true },
  ],
}

export const Contents: CollectionConfig = {
  slug: 'contents',
  versions: {
    drafts: true,
  },
  admin: {
    defaultColumns: ['title', 'category', 'contentType', 'publishedAt'],
    group: '内容运营',
    useAsTitle: 'title',
  },
  labels: {
    singular: '内容',
    plural: '内容',
  },
  fields: [
    { name: 'title', type: 'text', label: '标题', required: true },
    { name: 'coverTitle', type: 'text', label: '卡片主标题' },
    { name: 'category', type: 'relationship', label: '分类', relationTo: 'content-categories', required: true },
    {
      name: 'contentType',
      type: 'select',
      label: '内容类型',
      defaultValue: 'article',
      required: true,
      options: [
        { label: '文章', value: 'article' },
        { label: '活动', value: 'event' },
        { label: '机会', value: 'opportunity' },
        { label: '第三方服务入口', value: 'service_link' },
      ],
    },
    { name: 'summary', type: 'textarea', label: '摘要', required: true },
    {
      name: 'body',
      type: 'richText',
      label: '正文',
    },
    {
      name: 'tags',
      type: 'array',
      label: '标签',
      fields: [{ name: 'label', type: 'text', label: '标签', required: true }],
    },
    { name: 'publishedAt', type: 'date', label: '发布时间' },
    { name: 'isFeatured', type: 'checkbox', label: '推荐展示', defaultValue: false },
  ],
}
