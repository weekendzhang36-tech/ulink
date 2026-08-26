import { createSmsGateway, requestSmsPhoneVerification } from '@/lib/miniprogram/phone.ts'
import {
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
  readJson,
} from '@/lib/miniprogram/routeHelpers.ts'

export async function POST(request: Request) {
  return handleMiniProgramRoute(async () => {
    const body = await readJson<{ phone: string; sessionToken: string }>(request)
    const result = await requestSmsPhoneVerification({
      generateCode:
        process.env.MINIPROGRAM_MOCK_SMS === 'true' && process.env.MINIPROGRAM_MOCK_SMS_CODE
          ? () => process.env.MINIPROGRAM_MOCK_SMS_CODE || '123456'
          : undefined,
      input: body,
      now: new Date(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
      smsGateway: createSmsGateway(process.env),
    })

    return ok(result)
  })
}
