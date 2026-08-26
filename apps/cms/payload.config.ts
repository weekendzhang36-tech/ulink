import { s3Storage } from '@payloadcms/storage-s3'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Admins } from './src/collections/Admins'
import { Classes, Colleges, Majors, Schools } from './src/collections/Campus'
import { ContentCategories, ContentReservations, Contents } from './src/collections/Content'
import { GrowthPlans, Memberships, Orders, PaymentEvents } from './src/collections/GrowthPlans'
import { Media } from './src/collections/Media'
import { ServiceLinks } from './src/collections/ServiceLinks'
import {
  InstructorDataUseCommitments,
  NotificationSubscriptions,
  SmsVerificationChallenges,
  Students,
} from './src/collections/Students'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

function requireCosEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required when COS_BUCKET is configured`)
  }

  return value
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function createStoragePlugins() {
  const bucket = process.env.COS_BUCKET
  if (!bucket) return []

  const publicBaseUrl = process.env.COS_PUBLIC_BASE_URL
  const prefix = process.env.COS_PREFIX || 'ulink-media'

  return [
    s3Storage({
      acl: 'public-read',
      bucket,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: publicBaseUrl
            ? ({ filename, prefix: filePrefix }) => {
                const key = [filePrefix, filename].filter(Boolean).join('/')

                return `${trimTrailingSlash(publicBaseUrl)}/${key}`
              }
            : undefined,
          prefix,
        },
      },
      config: {
        credentials: {
          accessKeyId: requireCosEnv('COS_SECRET_ID'),
          secretAccessKey: requireCosEnv('COS_SECRET_KEY'),
        },
        endpoint: requireCosEnv('COS_ENDPOINT'),
        forcePathStyle: true,
        region: requireCosEnv('COS_REGION'),
      },
    }),
  ]
}

export default buildConfig({
  admin: {
    user: Admins.slug,
    meta: {
      titleSuffix: '- U Link',
    },
  },
  collections: [
    Admins,
    Schools,
    Colleges,
    Majors,
    Classes,
    Students,
    SmsVerificationChallenges,
    NotificationSubscriptions,
    InstructorDataUseCommitments,
    ContentCategories,
    Contents,
    ContentReservations,
    Media,
    GrowthPlans,
    Orders,
    Memberships,
    PaymentEvents,
    ServiceLinks,
  ],
  cors: [process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'],
  db: postgresAdapter({
    pool: {
      connectionString: requireEnv('DATABASE_URL'),
    },
  }),
  editor: lexicalEditor(),
  plugins: createStoragePlugins(),
  secret: requireEnv('PAYLOAD_SECRET'),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
