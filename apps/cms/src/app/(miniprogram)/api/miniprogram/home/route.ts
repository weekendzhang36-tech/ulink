import { getMiniProgramHomeData } from '@/lib/miniprogram/home.ts'
import {
  getBearerToken,
  getMiniProgramPayload,
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
} from '@/lib/miniprogram/routeHelpers.ts'

export async function GET(request: Request) {
  return handleMiniProgramRoute(async () => {
    const now = new Date()
    const data = await getMiniProgramHomeData({
      now,
      payload: await getMiniProgramPayload(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
      sessionToken: getBearerToken(request),
    })

    return ok(data)
  })
}
