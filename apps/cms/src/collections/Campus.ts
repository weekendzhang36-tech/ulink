import type { CollectionConfig } from 'payload'

export const Schools: CollectionConfig = {
  slug: 'schools',
  admin: {
    defaultColumns: ['name', 'city', 'isActive'],
    group: '学校数据',
    useAsTitle: 'name',
  },
  labels: {
    singular: '学校',
    plural: '学校',
  },
  fields: [
    { name: 'name', type: 'text', label: '学校名称', required: true },
    { name: 'city', type: 'text', label: '城市' },
    { name: 'isActive', type: 'checkbox', label: '启用', defaultValue: true },
  ],
}

export const Colleges: CollectionConfig = {
  slug: 'colleges',
  admin: {
    defaultColumns: ['name', 'school', 'isActive'],
    group: '学校数据',
    useAsTitle: 'name',
  },
  labels: {
    singular: '学院',
    plural: '学院',
  },
  fields: [
    { name: 'name', type: 'text', label: '学院名称', required: true },
    { name: 'school', type: 'relationship', label: '所属学校', relationTo: 'schools', required: true },
    { name: 'isActive', type: 'checkbox', label: '启用', defaultValue: true },
  ],
}

export const Majors: CollectionConfig = {
  slug: 'majors',
  admin: {
    defaultColumns: ['name', 'college', 'isActive'],
    group: '学校数据',
    useAsTitle: 'name',
  },
  labels: {
    singular: '专业',
    plural: '专业',
  },
  fields: [
    { name: 'name', type: 'text', label: '专业名称', required: true },
    { name: 'college', type: 'relationship', label: '所属学院', relationTo: 'colleges', required: true },
    { name: 'isActive', type: 'checkbox', label: '启用', defaultValue: true },
  ],
}

export const Classes: CollectionConfig = {
  slug: 'classes',
  admin: {
    defaultColumns: ['name', 'major', 'entryYear', 'isActive'],
    group: '学校数据',
    useAsTitle: 'name',
  },
  labels: {
    singular: '班级',
    plural: '班级',
  },
  fields: [
    { name: 'name', type: 'text', label: '班级名称', required: true },
    { name: 'major', type: 'relationship', label: '所属专业', relationTo: 'majors', required: true },
    { name: 'entryYear', type: 'number', label: '入学年份' },
    {
      name: 'instructorPhones',
      type: 'array',
      label: '指导员手机号',
      fields: [{ name: 'phone', type: 'text', label: '手机号', required: true }],
    },
    { name: 'isActive', type: 'checkbox', label: '启用', defaultValue: true },
  ],
}
