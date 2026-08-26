import { handleMiniProgramRoute, ok, getMiniProgramPayload } from '@/lib/miniprogram/routeHelpers.ts'
import { findActiveGrowthPlanForMiniProgram } from '@/lib/miniprogram/growthPlan.ts'

export async function GET() {
  return handleMiniProgramRoute(async () => {
    const payload = await getMiniProgramPayload()
    const growthPlan = await findActiveGrowthPlanForMiniProgram({ payload })

    return ok(growthPlan)
  })
}
