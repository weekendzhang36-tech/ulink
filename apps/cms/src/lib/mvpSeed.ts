type SeedCollection = 'content-categories' | 'contents' | 'growth-plans' | 'service-links'

export type MvpSeedPayload = {
  create(input: { collection: SeedCollection; data: Record<string, unknown> }): Promise<Record<string, unknown>>
  find(input: {
    collection: SeedCollection
    depth?: number
    limit?: number
    where: Record<string, unknown>
  }): Promise<{ docs: Record<string, unknown>[] }>
}

export interface MvpSeedResult {
  contentCategoriesCreated: number
  contentsCreated: number
  growthPlansCreated: number
  serviceLinksCreated: number
}

export function assertMvpSeedAllowed(
  env: Partial<Record<'MVP_SEED_ALLOW_PRODUCTION' | 'NODE_ENV', string>>,
) {
  if (env.NODE_ENV === 'production' && env.MVP_SEED_ALLOW_PRODUCTION !== 'true') {
    throw new Error('生产环境执行 seed:mvp 前必须设置 MVP_SEED_ALLOW_PRODUCTION=true')
  }
}

const modules = [
  { module: 'career_planning', sortOrder: 10, title: '职业规划' },
  { module: 'practice', sortOrder: 20, title: '实习实践' },
  { module: 'finance_foundation', sortOrder: 30, title: '金融底色' },
  { module: 'culture_exchange', sortOrder: 40, title: '文化交流' },
]

const growthPlan = {
  benefits: [
    { text: '实习机会和活动提醒' },
    { text: '成长内容推送' },
    { text: '咨询预约提醒' },
  ],
  description: '有效期内接收实习邀请、活动提醒、成长内容推送和咨询预约提醒。',
  durationDays: 183,
  isActive: true,
  priceCents: 500,
  title: '友邻成长计划',
}

const serviceLinks = [
  {
    contactHint: '提交后由顾问协助安排测评入口和结果解读。',
    description: '用于了解职业兴趣、能力倾向和适合优先探索的方向。',
    entryType: 'consultation',
    module: 'career_planning',
    serviceType: 'assessment',
    title: '职业测评入口',
  },
  {
    contactHint: '可先预约简历服务，确认经历整理和简历优化方式。',
    description: '围绕校园经历、实习经历和求职方向整理个人简历。',
    entryType: 'consultation',
    module: 'career_planning',
    serviceType: 'resume',
    title: '简历服务入口',
  },
  {
    contactHint: '留下需求后，顾问会协助安排规划咨询时间。',
    description: '围绕职业方向、大学四年节奏和下一步行动做轻量沟通。',
    entryType: 'consultation',
    module: 'career_planning',
    serviceType: 'consulting',
    title: '规划咨询预约',
  },
  {
    contactHint: '用于了解近期实训营、岗位介绍和实践机会。',
    description: '把可参与的实践机会整理成清晰入口。',
    entryType: 'consultation',
    module: 'practice',
    serviceType: 'consulting',
    title: '实践机会咨询',
  },
  {
    contactHint: '用于了解金融沙龙、财商课和机构交流安排。',
    description: '围绕金融职业认知和行业交流进行预约咨询。',
    entryType: 'consultation',
    module: 'finance_foundation',
    serviceType: 'consulting',
    title: '金融活动咨询',
  },
  {
    contactHint: '用于了解文化交流活动、非遗体验和研学路线安排。',
    description: '围绕本土文化、中外交流和研学信息进行咨询。',
    entryType: 'consultation',
    module: 'culture_exchange',
    serviceType: 'offline_space',
    title: '文化交流咨询',
  },
]

const starterContents = [
  {
    actionLabel: '了解方向',
    categoryModule: 'career_planning',
    contentType: 'article',
    coverTitle: '职业规划第一课',
    isFeatured: true,
    status: 'open',
    summary: '用一篇短内容先看清银行、券商、基金、风控等岗位差异，帮助新生建立方向感。',
    tags: ['职业规划', '金融岗位', '新生'],
    title: '新生职业规划第一课：先看懂金融岗位地图',
  },
  {
    actionLabel: '预约参加',
    capacity: 50,
    categoryModule: 'practice',
    contentType: 'event',
    coverTitle: '模拟实训营',
    isFeatured: true,
    status: 'open',
    summary: '2 小时体验一次客户资料整理、风险提示和汇报表达任务，适合还没有实习经验的同学。',
    tags: ['实训营', '真实任务', '实践机会'],
    title: '下周三｜金融岗位模拟实训营开放预约',
  },
  {
    actionLabel: '预约参加',
    capacity: 40,
    categoryModule: 'finance_foundation',
    contentType: 'event',
    coverTitle: '青年金融沙龙',
    isFeatured: true,
    status: 'open',
    summary: '邀请在职学长聊一线岗位、客户沟通和新人适应，适合想先听真实经历的同学。',
    tags: ['金融沙龙', '行业交流', '线下活动'],
    title: '周六下午｜青年金融沙龙：从校园到银行网点',
  },
  {
    actionLabel: '了解路线',
    categoryModule: 'culture_exchange',
    contentType: 'article',
    coverTitle: '文化交流路线',
    isFeatured: false,
    status: 'upcoming',
    summary: '从城市故事、非遗体验和中外交流主题开始，先了解后续文化交流模块的内容方向。',
    tags: ['非遗文化', '文化交流', '研学路线'],
    title: '文化交流预告：从城市故事和非遗体验开始',
  },
]

async function firstBy(input: {
  collection: SeedCollection
  payload: MvpSeedPayload
  where: Record<string, unknown>
}) {
  const result = await input.payload.find({
    collection: input.collection,
    depth: 0,
    limit: 1,
    where: input.where,
  })

  return result.docs[0]
}

function richTextFromParagraphs(paragraphs: string[]) {
  return {
    root: {
      children: paragraphs.map((text) => ({
        children: [{ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

async function ensureCategory(
  payload: MvpSeedPayload,
  module: (typeof modules)[number],
  result: MvpSeedResult,
) {
  const existing = await firstBy({
    collection: 'content-categories',
    payload,
    where: { and: [{ title: { equals: module.title } }, { module: { equals: module.module } }] },
  })
  if (existing) return existing

  result.contentCategoriesCreated += 1

  return payload.create({
    collection: 'content-categories',
    data: { ...module, isActive: true },
  })
}

async function ensureGrowthPlan(payload: MvpSeedPayload, result: MvpSeedResult) {
  const existing = await firstBy({
    collection: 'growth-plans',
    payload,
    where: { title: { equals: growthPlan.title } },
  })
  if (existing) return

  result.growthPlansCreated += 1
  await payload.create({
    collection: 'growth-plans',
    data: growthPlan,
  })
}

async function ensureServiceLink(
  payload: MvpSeedPayload,
  serviceLink: (typeof serviceLinks)[number],
  result: MvpSeedResult,
) {
  const existing = await firstBy({
    collection: 'service-links',
    payload,
    where: {
      and: [
        { title: { equals: serviceLink.title } },
        { module: { equals: serviceLink.module } },
      ],
    },
  })
  if (existing) return

  result.serviceLinksCreated += 1
  await payload.create({
    collection: 'service-links',
    data: { ...serviceLink, isActive: true },
  })
}

async function ensureContent(input: {
  categoryIdByModule: Map<string, string>
  content: (typeof starterContents)[number]
  payload: MvpSeedPayload
  result: MvpSeedResult
}) {
  const existing = await firstBy({
    collection: 'contents',
    payload: input.payload,
    where: { title: { equals: input.content.title } },
  })
  if (existing) return

  const category = input.categoryIdByModule.get(input.content.categoryModule)
  if (!category) {
    throw new Error(`缺少内容分类：${input.content.categoryModule}`)
  }

  const { categoryModule, tags, ...content } = input.content
  input.result.contentsCreated += 1
  await input.payload.create({
    collection: 'contents',
    data: {
      ...content,
      _status: 'published',
      body: richTextFromParagraphs([content.summary]),
      category,
      publishedAt: '2026-08-26T10:00:00.000Z',
      reservedCount: 0,
      tags: tags.map((label) => ({ label })),
    },
  })
}

export async function seedMvpStarterData({ payload }: { payload: MvpSeedPayload }) {
  const result: MvpSeedResult = {
    contentCategoriesCreated: 0,
    contentsCreated: 0,
    growthPlansCreated: 0,
    serviceLinksCreated: 0,
  }
  const categoryIdByModule = new Map<string, string>()

  for (const module of modules) {
    const category = await ensureCategory(payload, module, result)
    categoryIdByModule.set(module.module, String(category.id))
  }

  await ensureGrowthPlan(payload, result)

  for (const serviceLink of serviceLinks) {
    await ensureServiceLink(payload, serviceLink, result)
  }

  for (const content of starterContents) {
    await ensureContent({
      categoryIdByModule,
      content,
      payload,
      result,
    })
  }

  return result
}
