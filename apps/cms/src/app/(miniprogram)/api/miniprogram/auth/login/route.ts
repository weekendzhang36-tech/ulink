import { loginWithWechatCode, createWechatLoginGateway } from '@/lib/miniprogram/auth.ts'
import {
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
  readJson,
} from '@/lib/miniprogram/routeHelpers.ts'

export async function POST(request: Request) {
  return handleMiniProgramRoute(async () => {
    const body = await readJson<{ code: string }>(request)
    const result = await loginWithWechatCode({
      input: body,
      now: new Date(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
      wechatGateway: createWechatLoginGateway(process.env),
    })

    return ok(result)
  })
}
