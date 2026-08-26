import assert from 'node:assert/strict'
import test from 'node:test'

import { assertMvpSeedAllowed, seedMvpStarterData } from './mvpSeed.ts'

type CollectionName = 'content-categories' | 'contents' | 'growth-plans' | 'service-links'
type FakeDoc = Record<string, unknown> & { id: string }

test('creates MVP starter categories growth plan service links and contents', async () => {
  const payload = createFakeSeedPayload()

  const result = await seedMvpStarterData({ payload })

  assert.deepEqual(result, {
    contentCategoriesCreated: 4,
    contentsCreated: 4,
    growthPlansCreated: 1,
    serviceLinksCreated: 6,
  })
  assert.deepEqual(
    payload.docs['content-categories'].map((doc) => [doc.title, doc.module]),
    [
      ['职业规划', 'career_planning'],
      ['实习实践', 'practice'],
      ['金融底色', 'finance_foundation'],
      ['文化交流', 'culture_exchange'],
    ],
  )
  assert.deepEqual(payload.docs['growth-plans'][0], {
    benefits: [
      { text: '实习机会和活动提醒' },
      { text: '成长内容推送' },
      { text: '咨询预约提醒' },
    ],
    description: '有效期内接收实习邀请、活动提醒、成长内容推送和咨询预约提醒。',
    durationDays: 183,
    id: 'growth-plans_001',
    isActive: true,
    priceCents: 500,
    title: '友邻成长计划',
  })
  assert.equal(payload.docs.contents.length, 4)
  assert.equal(payload.docs.contents[0]._status, 'published')
  assert.equal(payload.docs.contents[0].category, 'content-categories_001')
  assert.equal(payload.docs.contents[1].contentType, 'event')
})

test('does not duplicate or overwrite existing MVP starter data', async () => {
  const payload = createFakeSeedPayload({
    'growth-plans': [
      {
        durationDays: 365,
        id: 'growth_existing',
        isActive: true,
        priceCents: 900,
        title: '友邻成长计划',
      },
    ],
  })

  await seedMvpStarterData({ payload })
  const second = await seedMvpStarterData({ payload })

  assert.deepEqual(second, {
    contentCategoriesCreated: 0,
    contentsCreated: 0,
    growthPlansCreated: 0,
    serviceLinksCreated: 0,
  })
  assert.equal(payload.docs['growth-plans'].length, 1)
  assert.equal(payload.docs['growth-plans'][0].priceCents, 900)
  assert.equal(payload.docs['content-categories'].length, 4)
  assert.equal(payload.docs.contents.length, 4)
  assert.equal(payload.docs['service-links'].length, 6)
})

test('rejects MVP starter data seed in production without explicit confirmation', () => {
  assert.throws(
    () => assertMvpSeedAllowed({ MVP_SEED_ALLOW_PRODUCTION: '', NODE_ENV: 'production' }),
    /生产环境/,
  )

  assert.doesNotThrow(() =>
    assertMvpSeedAllowed({ MVP_SEED_ALLOW_PRODUCTION: 'true', NODE_ENV: 'production' }),
  )
  assert.doesNotThrow(() => assertMvpSeedAllowed({ NODE_ENV: 'development' }))
})

function createFakeSeedPayload(seed: Partial<Record<CollectionName, FakeDoc[]>> = {}) {
  const docs: Record<CollectionName, FakeDoc[]> = {
    'content-categories': [...(seed['content-categories'] || [])],
    contents: [...(seed.contents || [])],
    'growth-plans': [...(seed['growth-plans'] || [])],
    'service-links': [...(seed['service-links'] || [])],
  }

  function nextId(collection: CollectionName) {
    return `${collection}_${String(docs[collection].length + 1).padStart(3, '0')}`
  }

  return {
    docs,
    async create(input: { collection: CollectionName; data: Record<string, unknown> }) {
      const doc = { ...input.data, id: nextId(input.collection) }
      docs[input.collection].push(doc)

      return doc
    },
    async find(input: { collection: CollectionName; where: Record<string, unknown> }) {
      return {
        docs: docs[input.collection].filter((doc) => matchesWhere(doc, input.where)),
      }
    },
  }
}

function matchesWhere(doc: FakeDoc, where: Record<string, unknown>): boolean {
  if ('and' in where && Array.isArray(where.and)) {
    return where.and.every((condition) => matchesWhere(doc, condition as Record<string, unknown>))
  }

  return Object.entries(where).every(([field, condition]) => {
    if (!condition || typeof condition !== 'object' || !('equals' in condition)) {
      return false
    }

    return doc[field] === (condition as { equals: unknown }).equals
  })
}
