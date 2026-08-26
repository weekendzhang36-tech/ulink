import { listPublishedContents } from '@/lib/miniprogram/content.ts'
import {
  getBearerToken,
  getMiniProgramPayload,
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
} from '@/lib/miniprogram/routeHelpers.ts'
import { requireCompletedStudentProfile } from '@/lib/miniprogram/studentAccess.ts'

export async function GET(request: Request) {
  return handleMiniProgramRoute(async () => {
    const url = new URL(request.url)
    const module = url.searchParams.get('module') || undefined
    const now = new Date()

    await requireCompletedStudentProfile({
      now,
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
      sessionToken: getBearerToken(request),
    })
    const contents = await listPublishedContents({
      module,
      payload: await getMiniProgramPayload(),
    })

    return ok(contents)
  })
}
