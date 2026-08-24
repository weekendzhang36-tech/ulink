import type { CollectionConfig } from 'payload'

export const Students: CollectionConfig = {
  slug: 'students',
  admin: {
    defaultColumns: ['realName', 'phone', 'school', 'verificationStatus'],
    group: '学生与认证',
    useAsTitle: 'realName',
  },
  labels: {
    singular: '学生',
    plural: '学生',
  },
  fields: [
    { name: 'wechatOpenId', type: 'text', label: '微信 OpenID', unique: true },
    { name: 'wechatUnionId', type: 'text', label: '微信 UnionID' },
    { name: 'phone', type: 'text', label: '手机号', required: true, unique: true },
    { name: 'realName', type: 'text', label: '真实姓名', required: true },
    {
      name: 'gender',
      type: 'select',
      label: '性别',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '不透露', value: 'undisclosed' },
      ],
    },
    { name: 'birthday', type: 'date', label: '生日' },
    { name: 'school', type: 'relationship', label: '学校', relationTo: 'schools', required: true },
    { name: 'college', type: 'relationship', label: '学院', relationTo: 'colleges', required: true },
    { name: 'major', type: 'relationship', label: '专业', relationTo: 'majors', required: true },
    { name: 'class', type: 'relationship', label: '班级', relationTo: 'classes', required: true },
    {
      name: 'verificationStatus',
      type: 'select',
      label: '认证状态',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: '待认证', value: 'pending' },
        { label: '已认证', value: 'verified' },
        { label: '需确认', value: 'needs_review' },
      ],
    },
    { name: 'agreedAt', type: 'date', label: '协议同意时间' },
    { name: 'submittedAt', type: 'date', label: '资料提交时间' },
  ],
}
