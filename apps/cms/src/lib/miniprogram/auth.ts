import { MiniProgramError, requireValue } from './errors.ts'
import { createSessionToken } from './session.ts'
import type { MiniProgramRepository, WechatLoginGateway } from './types.ts'

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new MiniProgramError('微信登录接口请求失败', 502)
  }

  return (await response.json()) as T
}

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

  if (env.WECHAT_MINIPROGRAM_APP_ID && env.WECHAT_MINIPROGRAM_APP_SECRET) {
    return {
      async exchangeCode(code) {
        const url = new URL('https://api.weixin.qq.com/sns/jscode2session')
        url.searchParams.set('appid', env.WECHAT_MINIPROGRAM_APP_ID || '')
        url.searchParams.set('secret', env.WECHAT_MINIPROGRAM_APP_SECRET || '')
        url.searchParams.set('js_code', code)
        url.searchParams.set('grant_type', 'authorization_code')
        const result = await fetchJson<{
          errcode?: number
          errmsg?: string
          openid?: string
          unionid?: string
        }>(url.toString())
        if (result.errcode || !result.openid) {
          throw new MiniProgramError(result.errmsg || '微信登录失败，请稍后重试', 502)
        }

        return {
          openId: result.openid,
          unionId: result.unionid,
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
