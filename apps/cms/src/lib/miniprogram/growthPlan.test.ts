import assert from 'node:assert/strict'
import test from 'node:test'

import { findActiveGrowthPlanForMiniProgram } from './growthPlan.ts'

test('returns only Mini Program growth plan fields from the active Payload document', async () => {
  const plan = await findActiveGrowthPlanForMiniProgram({
    payload: {
      find: async () => ({
        docs: [
          {
            _status: 'published',
            benefits: [{ id: 'benefit_001', text: '实习机会和活动提醒' }, { text: '' }],
            createdAt: '2026-08-26T09:00:00.000Z',
            description: '有效期内接收实习邀请、活动提醒和成长内容推送。',
            durationDays: 183,
            id: 'growth_plan_001',
            isActive: true,
            priceCents: 500,
            title: '友邻成长计划',
            updatedAt: '2026-08-26T09:30:00.000Z',
          },
        ],
      }),
    },
  })

  assert.deepEqual(plan, {
    benefits: ['实习机会和活动提醒'],
    description: '有效期内接收实习邀请、活动提醒和成长内容推送。',
    durationDays: 183,
    id: 'growth_plan_001',
    isActive: true,
    priceCents: 500,
    priceText: '¥5 / 半年',
    title: '友邻成长计划',
  })
})

test('returns null when no active growth plan is configured', async () => {
  const plan = await findActiveGrowthPlanForMiniProgram({
    payload: {
      find: async () => ({ docs: [] }),
    },
  })

  assert.equal(plan, null)
})
