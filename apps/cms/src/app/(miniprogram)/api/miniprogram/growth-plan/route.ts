import { handleMiniProgramRoute, ok, getMiniProgramPayload } from '@/lib/miniprogram/routeHelpers.ts'

export async function GET() {
  return handleMiniProgramRoute(async () => {
    const payload = await getMiniProgramPayload()
    const result = await payload.find({
      collection: 'growth-plans',
      limit: 1,
      where: { isActive: { equals: true } },
    })

    return ok(result.docs[0] || null)
  })
}
