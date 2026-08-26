import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'

import { MiniProgramError, requireValue } from './errors.ts'
import { verifySessionToken } from './session.ts'
import type { MiniProgramRepository, SmsGateway, WechatPhoneGateway } from './types.ts'

type PhoneVerificationPayload = {
  exp: number
  phone: string
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function createSmsCodeHash(input: { code: string; phone: string; secret: string }) {
  return createHmac('sha256', input.secret).update(`${input.phone}:${input.code}`).digest('base64url')
}

function verifySmsCodeHash(input: { code: string; hash: string; phone: string; secret: string }) {
  const expected = createSmsCodeHash(input)
  const expectedBuffer = Buffer.from(expected)
  const hashBuffer = Buffer.from(input.hash)

  return (
    expectedBuffer.length === hashBuffer.length &&
    timingSafeEqual(expectedBuffer, hashBuffer)
  )
}

function normalizeMainlandPhone(value: string | undefined) {
  const phone = requireValue(value, '手机号')
  if (!/^1\d{10}$/.test(phone)) {
    throw new MiniProgramError('请输入 11 位中国大陆手机号')
  }

  return phone
}

function generateSixDigitCode() {
  return String(randomInt(100000, 1000000))
}

export function createPhoneVerificationToken(input: {
  expiresInSeconds: number
  now: Date
  phone: string
  secret: string
}) {
  const payload: PhoneVerificationPayload = {
    exp: Math.floor(input.now.getTime() / 1000) + input.expiresInSeconds,
    phone: input.phone,
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')

  return `${encoded}.${sign(encoded, input.secret)}`
}

export function verifyPhoneVerificationToken(input: {
  expectedPhone: string
  now: Date
  secret: string
  token: string
}) {
  const [encoded, signature] = input.token.split('.')
  if (!encoded || !signature) {
    throw new MiniProgramError('手机号验证无效')
  }

  const expected = sign(encoded, input.secret)
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new MiniProgramError('手机号验证无效')
  }

  let payload: PhoneVerificationPayload
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as PhoneVerificationPayload
  } catch {
    throw new MiniProgramError('手机号验证无效')
  }

  if (payload.exp <= Math.floor(input.now.getTime() / 1000)) {
    throw new MiniProgramError('手机号验证已过期')
  }
  if (payload.phone !== input.expectedPhone) {
    throw new MiniProgramError('手机号验证不匹配')
  }

  return payload
}

export async function verifyPhoneNumberWithWechatCode(input: {
  input: {
    phoneCode: string
    sessionToken: string
  }
  now: Date
  secret: string
  wechatPhoneGateway: WechatPhoneGateway
}) {
  verifySessionToken({
    now: input.now,
    secret: input.secret,
    token: input.input.sessionToken,
  })
  const phoneCode = requireValue(input.input.phoneCode, '手机号授权 code')
  const phoneInfo = await input.wechatPhoneGateway.getPhoneNumber(phoneCode)
  const phone = requireValue(phoneInfo.purePhoneNumber, '手机号')

  return {
    phone,
    phoneVerificationToken: createPhoneVerificationToken({
      expiresInSeconds: 60 * 10,
      now: input.now,
      phone,
      secret: input.secret,
    }),
  }
}

export async function requestSmsPhoneVerification(input: {
  generateCode?: () => string
  input: {
    phone: string
    sessionToken: string
  }
  now: Date
  repository: MiniProgramRepository
  secret: string
  smsGateway: SmsGateway
}) {
  verifySessionToken({
    now: input.now,
    secret: input.secret,
    token: input.input.sessionToken,
  })
  const phone = normalizeMainlandPhone(input.input.phone)
  const code = (input.generateCode || generateSixDigitCode)()
  const expiresAt = new Date(input.now.getTime() + 10 * 60 * 1000).toISOString()

  await input.repository.createSmsVerificationChallenge({
    attemptCount: 0,
    codeHash: createSmsCodeHash({ code, phone, secret: input.secret }),
    expiresAt,
    phone,
    requestedAt: input.now.toISOString(),
  })
  await input.smsGateway.sendCode({ code, phone })

  return {
    expiresAt,
    phone,
  }
}

export async function verifyPhoneNumberWithSmsCode(input: {
  input: {
    phone: string
    sessionToken: string
    smsCode: string
  }
  now: Date
  repository: MiniProgramRepository
  secret: string
}) {
  verifySessionToken({
    now: input.now,
    secret: input.secret,
    token: input.input.sessionToken,
  })
  const phone = normalizeMainlandPhone(input.input.phone)
  const smsCode = requireValue(input.input.smsCode, '短信验证码')
  const challenge = await input.repository.findLatestSmsVerificationChallengeByPhone(phone)
  if (!challenge) {
    throw new MiniProgramError('请先获取短信验证码')
  }
  if (challenge.consumedAt) {
    throw new MiniProgramError('短信验证码已使用，请重新获取')
  }
  if (Date.parse(challenge.expiresAt) <= input.now.getTime()) {
    throw new MiniProgramError('短信验证码已过期，请重新获取')
  }
  if (challenge.attemptCount >= 5) {
    throw new MiniProgramError('短信验证码错误次数过多，请重新获取')
  }

  const attemptCount = challenge.attemptCount + 1
  if (!verifySmsCodeHash({ code: smsCode, hash: challenge.codeHash, phone, secret: input.secret })) {
    await input.repository.updateSmsVerificationChallenge(challenge.id, { attemptCount })
    throw new MiniProgramError('短信验证码不正确')
  }

  await input.repository.updateSmsVerificationChallenge(challenge.id, {
    attemptCount,
    consumedAt: input.now.toISOString(),
  })

  return {
    phone,
    phoneVerificationToken: createPhoneVerificationToken({
      expiresInSeconds: 60 * 10,
      now: input.now,
      phone,
      secret: input.secret,
    }),
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new MiniProgramError('微信接口请求失败', 502)
  }

  return (await response.json()) as T
}

async function getAccessToken(env: NodeJS.ProcessEnv) {
  const appId = env.WECHAT_MINIPROGRAM_APP_ID
  const appSecret = env.WECHAT_MINIPROGRAM_APP_SECRET
  if (!appId || !appSecret) {
    throw new MiniProgramError('微信手机号接口尚未配置 AppID/AppSecret', 503)
  }

  const url = new URL('https://api.weixin.qq.com/cgi-bin/token')
  url.searchParams.set('grant_type', 'client_credential')
  url.searchParams.set('appid', appId)
  url.searchParams.set('secret', appSecret)
  const result = await fetchJson<{ access_token?: string; errcode?: number; errmsg?: string }>(
    url.toString(),
  )
  if (!result.access_token || result.errcode) {
    throw new MiniProgramError(result.errmsg || '获取微信 access_token 失败', 502)
  }

  return result.access_token
}

export function createWechatPhoneGateway(env: NodeJS.ProcessEnv): WechatPhoneGateway {
  if (env.MINIPROGRAM_MOCK_WECHAT_PHONE === 'true') {
    return {
      async getPhoneNumber(code) {
        return {
          countryCode: '86',
          phoneNumber: `+86-${code}`,
          purePhoneNumber: env.MINIPROGRAM_MOCK_PHONE || '13800000001',
        }
      },
    }
  }

  return {
    async getPhoneNumber(code) {
      const accessToken = await getAccessToken(env)
      const url = new URL('https://api.weixin.qq.com/wxa/business/getuserphonenumber')
      url.searchParams.set('access_token', accessToken)
      const result = await fetchJson<{
        errcode?: number
        errmsg?: string
        phone_info?: {
          countryCode?: string
          phoneNumber?: string
          purePhoneNumber?: string
        }
      }>(url.toString(), {
        body: JSON.stringify({ code }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      if (result.errcode || !result.phone_info?.purePhoneNumber) {
        throw new MiniProgramError(result.errmsg || '获取微信手机号失败', 502)
      }

      return {
        countryCode: result.phone_info.countryCode,
        phoneNumber: result.phone_info.phoneNumber,
        purePhoneNumber: result.phone_info.purePhoneNumber,
      }
    },
  }
}

export function createSmsGateway(env: NodeJS.ProcessEnv): SmsGateway {
  if (env.MINIPROGRAM_MOCK_SMS === 'true') {
    return {
      async sendCode() {
        return undefined
      },
    }
  }

  throw new MiniProgramError('短信服务尚未配置', 503)
}
