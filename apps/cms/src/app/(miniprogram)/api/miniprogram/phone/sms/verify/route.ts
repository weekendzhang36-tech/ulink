import { verifyPhoneNumberWithSmsCode } from '@/lib/miniprogram/phone.ts'
import {
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
  readJson,
} from '@/lib/miniprogram/routeHelpers.ts'

export async function POST(request: Request) {
  return handleMiniProgramRoute(async () => {
    const body = await readJson<{ phone: string; sessionToken: string; smsCode: string }>(request)
    const result = await verifyPhoneNumberWithSmsCode({
      input: body,
      now: new Date(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result)
  })
}
