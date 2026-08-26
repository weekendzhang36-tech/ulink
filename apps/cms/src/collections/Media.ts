import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    group: '内容运营',
    useAsTitle: 'alt',
  },
  labels: {
    singular: '媒体文件',
    plural: '媒体文件',
  },
  upload: {
    adminThumbnail: 'card',
    imageSizes: [
      {
        fit: 'cover',
        height: 420,
        name: 'card',
        width: 750,
      },
      {
        fit: 'inside',
        height: 1200,
        name: 'large',
        width: 1200,
      },
    ],
    mimeTypes: ['image/*', 'application/pdf'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: '替代说明',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      label: '说明文字',
    },
  ],
}
