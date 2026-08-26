import { createWechatPhoneGateway, verifyPhoneNumberWithWechatCode } from '@/lib/miniprogram/phone.ts'
import { getServerSecret, handleMiniProgramRoute, ok, readJson } from '@/lib/miniprogram/routeHelpers.ts'

export async function POST(request: Request) {
  return handleMiniProgramRoute(async () => {
    const body = await readJson<{ phoneCode: string; sessionToken: string }>(request)
    const result = await verifyPhoneNumberWithWechatCode({
      input: body,
      now: new Date(),
      secret: getServerSecret(),
      wechatPhoneGateway: createWechatPhoneGateway(process.env),
    })

    return ok(result)
  })
}
