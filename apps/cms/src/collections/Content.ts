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
    defaultColumns: ['title', 'category', 'contentType', 'openStatus', 'isMemberOnly', 'publishedAt'],
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
    { name: 'coverImage', type: 'relationship', label: '封面图', relationTo: 'media' },
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
    {
      name: 'openStatus',
      type: 'select',
      label: '开放状态',
      defaultValue: 'open',
      required: true,
      options: [
        { label: '报名中', value: 'open' },
        { label: '即将开放', value: 'upcoming' },
        { label: '已结束', value: 'closed' },
      ],
    },
    { name: 'summary', type: 'textarea', label: '摘要', required: true },
    {
      name: 'body',
      type: 'richText',
      label: '正文（富文本）',
      admin: {
        description: '像写文档一样编辑正文，可使用标题、段落、列表、引用、图片和链接；不要粘贴自定义 HTML 或脚本。',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: '标签',
      fields: [{ name: 'label', type: 'text', label: '标签', required: true }],
    },
    { name: 'isMemberOnly', type: 'checkbox', label: '会员专属', defaultValue: false },
    { name: 'actionLabel', type: 'text', label: '行动按钮文案' },
    { name: 'actionUrl', type: 'text', label: '行动链接' },
    { name: 'capacity', type: 'number', label: '名额上限' },
    { name: 'reservedCount', type: 'number', label: '已预约人数', defaultValue: 0 },
    { name: 'publishedAt', type: 'date', label: '发布时间' },
    { name: 'isFeatured', type: 'checkbox', label: '推荐展示', defaultValue: false },
  ],
}

export const ContentReservations: CollectionConfig = {
  slug: 'content-reservations',
  admin: {
    defaultColumns: ['content', 'student', 'status', 'reservedAt'],
    group: '内容运营',
    useAsTitle: 'content',
  },
  labels: {
    singular: '内容预约',
    plural: '内容预约',
  },
  fields: [
    { name: 'content', type: 'relationship', label: '内容', relationTo: 'contents', required: true },
    { name: 'student', type: 'relationship', label: '学生', relationTo: 'students', required: true },
    {
      name: 'status',
      type: 'select',
      label: '预约状态',
      defaultValue: 'reserved',
      required: true,
      options: [
        { label: '已预约', value: 'reserved' },
        { label: '已取消', value: 'cancelled' },
      ],
    },
    { name: 'reservedAt', type: 'date', label: '预约时间', required: true },
  ],
}
