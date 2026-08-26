import { recordNotificationSubscription } from '@/lib/miniprogram/notification.ts'
import {
  getBearerToken,
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
  readJson,
} from '@/lib/miniprogram/routeHelpers.ts'

export async function POST(request: Request) {
  return handleMiniProgramRoute(async () => {
    const body = await readJson<{ purpose: string; templateId: string }>(request)
    const result = await recordNotificationSubscription({
      input: {
        purpose: body.purpose,
        sessionToken: getBearerToken(request),
        templateId: body.templateId,
      },
      now: new Date(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result, 201)
  })
}
