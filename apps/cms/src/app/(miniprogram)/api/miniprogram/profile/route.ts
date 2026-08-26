import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import { getStudentProfileForEdit } from '@/lib/miniprogram/profile.ts'
import {
  getBearerToken,
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
    const result = await getStudentProfileForEdit({
      input: {
        sessionToken: requireSessionToken(request),
      },
      now: new Date(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result)
  })
}
