import {
  listInstructorVerificationStudents,
  reviewInstructorStudents,
} from '@/lib/miniprogram/instructor.ts'
import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import { createNotificationGateway } from '@/lib/miniprogram/notificationDelivery.ts'
import {
  getBearerToken,
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
  readJson,
} from '@/lib/miniprogram/routeHelpers.ts'
import type { VerificationStatus } from '@/lib/miniprogram/types.ts'

function requireSessionToken(request: Request, bodyToken?: string) {
  const token = bodyToken || getBearerToken(request)
  if (!token) {
    throw new MiniProgramError('请先登录', 401)
  }

  return token
}

export async function GET(request: Request) {
  return handleMiniProgramRoute(async () => {
    const url = new URL(request.url)
    const status = (url.searchParams.get('status') || undefined) as VerificationStatus | undefined
    const result = await listInstructorVerificationStudents({
      input: {
        sessionToken: requireSessionToken(request),
        status,
      },
      now: new Date(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result)
  })
}

export async function POST(request: Request) {
  return handleMiniProgramRoute(async () => {
    const body = await readJson<{
      action: 'needs_review' | 'verified'
      sessionToken?: string
      studentIds: string[]
    }>(request)
    const result = await reviewInstructorStudents({
      input: {
        action: body.action,
        sessionToken: requireSessionToken(request, body.sessionToken),
        studentIds: body.studentIds,
      },
      notificationGateway: createNotificationGateway(process.env),
      now: new Date(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result)
  })
}
