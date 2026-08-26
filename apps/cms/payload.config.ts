import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Admins } from './src/collections/Admins'
import { Classes, Colleges, Majors, Schools } from './src/collections/Campus'
import { ContentCategories, Contents } from './src/collections/Content'
import { GrowthPlans, Memberships, Orders, PaymentEvents } from './src/collections/GrowthPlans'
import { ServiceLinks } from './src/collections/ServiceLinks'
import { Students } from './src/collections/Students'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
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
    ContentCategories,
    Contents,
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
  secret: requireEnv('PAYLOAD_SECRET'),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
