import { MiniProgramError, requireValue } from './errors.ts'
import { createSessionToken } from './session.ts'
import type { MiniProgramRepository, WechatLoginGateway } from './types.ts'

export async function loginWithWechatCode({
  input,
  now,
  repository,
  secret,
  wechatGateway,
}: {
  input: { code: string }
  now: Date
  repository: MiniProgramRepository
  secret: string
  wechatGateway: WechatLoginGateway
}) {
  const code = requireValue(input.code, '微信登录 code')
  const identity = await wechatGateway.exchangeCode(code)
  if (!identity.openId) {
    throw new MiniProgramError('微信登录失败，请稍后重试', 502)
  }

  const student = await repository.findStudentByOpenId(identity.openId)
  const sessionToken = createSessionToken({
    expiresInSeconds: 60 * 60 * 24 * 30,
    now,
    openId: identity.openId,
    secret,
    studentId: student?.id,
    unionId: identity.unionId,
  })

  return {
    profileCompleted: Boolean(student),
    sessionToken,
    student,
  }
}

export function createWechatLoginGateway(env: NodeJS.ProcessEnv): WechatLoginGateway {
  if (env.MINIPROGRAM_MOCK_WECHAT_LOGIN === 'true') {
    return {
      async exchangeCode(code) {
        return {
          openId: `dev_openid_${code}`,
          unionId: `dev_unionid_${code}`,
        }
      },
    }
  }

  return {
    async exchangeCode() {
      throw new MiniProgramError('微信登录尚未配置，请设置真实 AppID/AppSecret 或启用本地 mock 登录', 503)
    },
  }
}
