import { registerForPublishedContent } from '@/lib/miniprogram/content.ts'
import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import {
  getBearerToken,
  getMiniProgramPayload,
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
} from '@/lib/miniprogram/routeHelpers.ts'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleMiniProgramRoute(async () => {
    const { id } = await params
    const sessionToken = getBearerToken(request)
    if (!sessionToken) {
      throw new MiniProgramError('请先登录', 401)
    }
    const result = await registerForPublishedContent({
      id,
      input: { sessionToken },
      now: new Date(),
      payload: await getMiniProgramPayload(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result, result.alreadyReserved ? 200 : 201)
  })
}
