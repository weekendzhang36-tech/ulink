import { getProfileStatus } from '@/lib/miniprogram/profileStatus.ts'
import {
  getBearerToken,
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
} from '@/lib/miniprogram/routeHelpers.ts'

export async function GET(request: Request) {
  return handleMiniProgramRoute(async () => {
    const data = await getProfileStatus({
      now: new Date(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
      sessionToken: getBearerToken(request),
    })

    return ok(data)
  })
}
