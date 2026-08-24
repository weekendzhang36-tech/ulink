import type { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  auth: true,
  admin: {
    defaultColumns: ['email', 'name', 'role'],
    useAsTitle: 'email',
  },
  labels: {
    singular: '管理员',
    plural: '管理员',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '姓名',
    },
    {
      name: 'role',
      type: 'select',
      label: '角色',
      defaultValue: 'operator',
      required: true,
      options: [
        { label: '超级管理员', value: 'super_admin' },
        { label: '运营人员', value: 'operator' },
      ],
    },
  ],
}
