import { submitStudentProfile } from '@/lib/miniprogram/profile.ts'
import { createNotificationGateway } from '@/lib/miniprogram/notificationDelivery.ts'
import {
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
  readJson,
} from '@/lib/miniprogram/routeHelpers.ts'
import type { StudentProfileInput } from '@/lib/miniprogram/types.ts'

export async function POST(request: Request) {
  return handleMiniProgramRoute(async () => {
    const body = await readJson<StudentProfileInput>(request)
    const result = await submitStudentProfile({
      input: body,
      notificationGateway: createNotificationGateway(process.env),
      now: new Date(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result)
  })
}
