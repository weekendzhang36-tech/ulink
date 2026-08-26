import { listContentReservationsForStudent } from '@/lib/miniprogram/content.ts'
import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import {
  getBearerToken,
  getMiniProgramPayload,
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
} from '@/lib/miniprogram/routeHelpers.ts'

function requireSessionToken(request: Request) {
  const token = getBearerToken(request)
  if (!token) {
    throw new MiniProgramError('请先登录', 401)
  }

  return token
}

export async function GET(request: Request) {
  return handleMiniProgramRoute(async () => {
    const result = await listContentReservationsForStudent({
      input: {
        sessionToken: requireSessionToken(request),
      },
      now: new Date(),
      payload: await getMiniProgramPayload(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result)
  })
}
