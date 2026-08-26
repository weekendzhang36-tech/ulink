import { cancelContentReservation } from '@/lib/miniprogram/content.ts'
import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import {
  getBearerToken,
  getMiniProgramPayload,
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
} from '@/lib/miniprogram/routeHelpers.ts'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reservationId: string }> },
) {
  return handleMiniProgramRoute(async () => {
    const { reservationId } = await params
    const sessionToken = getBearerToken(request)
    if (!sessionToken) {
      throw new MiniProgramError('请先登录', 401)
    }
    const result = await cancelContentReservation({
      input: {
        reservationId,
        sessionToken,
      },
      now: new Date(),
      payload: await getMiniProgramPayload(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result)
  })
}
