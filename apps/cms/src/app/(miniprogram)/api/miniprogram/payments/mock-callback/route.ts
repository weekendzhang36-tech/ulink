import { confirmMockMembershipPayment } from '@/lib/miniprogram/membership.ts'
import { getMiniProgramRepository, handleMiniProgramRoute, ok, readJson } from '@/lib/miniprogram/routeHelpers.ts'

export async function POST(request: Request) {
  return handleMiniProgramRoute(async () => {
    const body = await readJson<{ orderNo: string }>(request)
    const now = new Date()
    const result = await confirmMockMembershipPayment({
      env: process.env,
      input: {
        orderNo: body.orderNo,
      },
      now,
      repository: await getMiniProgramRepository(),
    })

    return ok(result)
  })
}
