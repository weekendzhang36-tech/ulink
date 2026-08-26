import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import { cancelMembershipOrder } from '@/lib/miniprogram/membership.ts'
import {
  getBearerToken,
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
} from '@/lib/miniprogram/routeHelpers.ts'

export async function POST(request: Request, { params }: { params: Promise<{ orderNo: string }> }) {
  return handleMiniProgramRoute(async () => {
    const { orderNo } = await params
    const sessionToken = getBearerToken(request)
    if (!sessionToken) {
      throw new MiniProgramError('请先登录', 401)
    }
    const result = await cancelMembershipOrder({
      input: { orderNo, sessionToken },
      now: new Date(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result)
  })
}
