import assert from 'node:assert/strict'
import test from 'node:test'

import { listActiveServiceLinks } from './serviceLinks.ts'

function payloadFor(docs: Record<string, unknown>[]) {
  return {
    find: async () => ({ docs }),
  }
}

test('lists active career planning service links without exposing inactive entries', async () => {
  const links = await listActiveServiceLinks({
    module: 'career_planning',
    payload: payloadFor([
      {
        description: '完成一份职业兴趣和能力倾向测评。',
        id: 'service_assessment_001',
        isActive: true,
        module: 'career_planning',
        serviceType: 'assessment',
        title: '职业测评入口',
        url: 'https://example.com/assessment',
      },
      {
        description: '把已有简历交给服务方进行优化。',
        id: 'service_resume_001',
        isActive: true,
        module: 'career_planning',
        serviceType: 'resume',
        title: '简历优化入口',
        url: 'https://example.com/resume',
      },
      {
        description: '已下线服务不应展示。',
        id: 'service_inactive_001',
        isActive: false,
        module: 'career_planning',
        serviceType: 'assessment',
        title: '已下线测评',
        url: 'https://example.com/inactive',
      },
      {
        description: '线下空间入口不属于职业规划页。',
        id: 'service_space_001',
        isActive: true,
        module: 'culture_exchange',
        serviceType: 'offline_space',
        title: '咖啡空间',
        url: 'https://example.com/space',
      },
    ]),
  })

  assert.deepEqual(
    links.map((link) => link.id),
    ['service_assessment_001', 'service_resume_001'],
  )
  assert.equal(links[0].typeLabel, '职业测评')
  assert.equal(links[0].actionLabel, '开始测评')
  assert.equal(links[0].entryType, 'external_link')
  assert.equal(links[1].typeLabel, '简历服务')
  assert.equal(links[1].actionLabel, '查看简历服务')
})

test('uses the configured module when listing active service links', async () => {
  const links = await listActiveServiceLinks({
    module: 'finance_foundation',
    payload: payloadFor([
      {
        description: '对接金融沙龙报名和咨询。',
        id: 'service_finance_consulting',
        isActive: true,
        module: 'finance_foundation',
        serviceType: 'consulting',
        title: '金融沙龙咨询',
        url: 'https://example.com/finance-consulting',
      },
      {
        description: '职业规划模块里的咨询入口。',
        id: 'service_career_consulting',
        isActive: true,
        module: 'career_planning',
        serviceType: 'consulting',
        title: '职业规划咨询',
        url: 'https://example.com/career-consulting',
      },
    ]),
  })

  assert.deepEqual(
    links.map((link) => link.id),
    ['service_finance_consulting'],
  )
  assert.equal(links[0].module, 'finance_foundation')
})

test('keeps configured Mini Program service entry fields for third-party services', async () => {
  const links = await listActiveServiceLinks({
    module: 'career_planning',
    payload: payloadFor([
      {
        description: '打开第三方职业测评小程序。',
        entryType: 'mini_program',
        id: 'service_assessment_miniprogram',
        isActive: true,
        miniProgramAppId: 'wx1234567890abcdef',
        miniProgramPath: 'pages/start/index?source=ulink',
        module: 'career_planning',
        serviceType: 'assessment',
        title: '职业测评小程序',
      },
    ]),
  })

  assert.deepEqual(links[0], {
    actionLabel: '开始测评',
    contactHint: undefined,
    description: '打开第三方职业测评小程序。',
    entryType: 'mini_program',
    id: 'service_assessment_miniprogram',
    miniProgramAppId: 'wx1234567890abcdef',
    miniProgramPath: 'pages/start/index?source=ulink',
    module: 'career_planning',
    serviceType: 'assessment',
    title: '职业测评小程序',
    typeLabel: '职业测评',
    url: undefined,
  })
})

test('keeps configured consultation hint for service entries without a direct link', async () => {
  const links = await listActiveServiceLinks({
    module: 'career_planning',
    payload: payloadFor([
      {
        contactHint: '请先预约顾问，确认第三方简历服务开放时间。',
        description: '由顾问承接简历服务需求。',
        entryType: 'consultation',
        id: 'service_resume_contact',
        isActive: true,
        module: 'career_planning',
        serviceType: 'resume',
        title: '简历服务咨询',
      },
    ]),
  })

  assert.equal(links[0].entryType, 'consultation')
  assert.equal(links[0].contactHint, '请先预约顾问，确认第三方简历服务开放时间。')
})
