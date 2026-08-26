import { confirmInstructorDataUseCommitment } from '@/lib/miniprogram/instructor.ts'
import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import {
  getBearerToken,
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
  readJson,
} from '@/lib/miniprogram/routeHelpers.ts'

function requireSessionToken(request: Request, bodyToken?: string) {
  const token = bodyToken || getBearerToken(request)
  if (!token) {
    throw new MiniProgramError('请先登录', 401)
  }

  return token
}

export async function POST(request: Request) {
  return handleMiniProgramRoute(async () => {
    const body = await readJson<{ sessionToken?: string }>(request)
    const result = await confirmInstructorDataUseCommitment({
      input: {
        sessionToken: requireSessionToken(request, body.sessionToken),
      },
      now: new Date(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result)
  })
}
