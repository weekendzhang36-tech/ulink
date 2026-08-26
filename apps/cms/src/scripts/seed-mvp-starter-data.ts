import { getPayload } from 'payload'

import { assertMvpSeedAllowed, seedMvpStarterData, type MvpSeedPayload } from '../lib/mvpSeed.ts'

async function main() {
  assertMvpSeedAllowed(process.env)

  const { default: config } = await import('../../payload.config.ts')
  const payload = await getPayload({ config })
  const result = await seedMvpStarterData({
    payload: payload as unknown as MvpSeedPayload,
  })

  console.log(
    [
      'MVP 首批数据初始化完成',
      `新增内容分类 ${result.contentCategoriesCreated} 个`,
      `新增成长计划 ${result.growthPlansCreated} 个`,
      `新增服务入口 ${result.serviceLinksCreated} 个`,
      `新增发布内容 ${result.contentsCreated} 条`,
      '已存在的数据不会重复创建，也不会被覆盖。',
    ].join('\n'),
  )

  await payload.destroy()
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
