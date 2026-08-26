import { createSign, randomBytes } from 'node:crypto'

import { MiniProgramError } from './errors.ts'
import type { PaymentGateway } from './types.ts'

type FetchJson = <T>(url: string, init?: RequestInit) => Promise<T>

function normalizePrivateKey(privateKey: string) {
  return privateKey.replace(/\\n/g, '\n')
}

function signWithPrivateKey(message: string, privateKey: string) {
  const signer = createSign('RSA-SHA256')
  signer.update(message)
  signer.end()

  return signer.sign(normalizePrivateKey(privateKey), 'base64')
}

function requireWechatPayEnv(env: NodeJS.ProcessEnv) {
  const appId = env.WECHAT_MINIPROGRAM_APP_ID
  const mchId = env.WECHAT_PAY_MCH_ID
  const notifyUrl = env.WECHAT_PAY_NOTIFY_URL
  const privateKey = env.WECHAT_PAY_PRIVATE_KEY
  const serialNo = env.WECHAT_PAY_CERT_SERIAL_NO
  if (!appId || !mchId || !notifyUrl || !privateKey || !serialNo) {
    throw new MiniProgramError('微信支付尚未配置，请先启用本地 mock 支付或接入真实商户号', 503)
  }

  return { appId, mchId, notifyUrl, privateKey, serialNo }
}

async function defaultFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new MiniProgramError('微信支付下单接口请求失败', 502)
  }

  return (await response.json()) as T
}

function createAuthorizationHeader(input: {
  body: string
  mchId: string
  method: string
  nonce: string
  privateKey: string
  serialNo: string
  timestamp: string
  urlPath: string
}) {
  const message = `${input.method}\n${input.urlPath}\n${input.timestamp}\n${input.nonce}\n${input.body}\n`
  const signature = signWithPrivateKey(message, input.privateKey)

  return `WECHATPAY2-SHA256-RSA2048 mchid="${input.mchId}",nonce_str="${input.nonce}",signature="${signature}",timestamp="${input.timestamp}",serial_no="${input.serialNo}"`
}

function createMiniProgramPaySign(input: {
  appId: string
  nonce: string
  packageValue: string
  privateKey: string
  timestamp: string
}) {
  return signWithPrivateKey(
    `${input.appId}\n${input.timestamp}\n${input.nonce}\n${input.packageValue}\n`,
    input.privateKey,
  )
}

export function createWechatPayGateway({
  env,
  fetchJson = defaultFetchJson,
  nonce = () => randomBytes(16).toString('hex'),
  now = () => new Date(),
}: {
  env: NodeJS.ProcessEnv
  fetchJson?: FetchJson
  nonce?: () => string
  now?: () => Date
}): PaymentGateway {
  return {
    async createPaymentParams({ amountCents, body, orderNo, student }) {
      const config = requireWechatPayEnv(env)
      const timeStamp = String(Math.floor(now().getTime() / 1000))
      const requestNonce = nonce()
      const payNonce = nonce()
      const url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi'
      const requestBody = JSON.stringify({
        amount: {
          currency: 'CNY',
          total: amountCents,
        },
        appid: config.appId,
        description: body,
        mchid: config.mchId,
        notify_url: config.notifyUrl,
        out_trade_no: orderNo,
        payer: {
          openid: student.wechatOpenId,
        },
      })
      const prepay = await fetchJson<{ code?: string; message?: string; prepay_id?: string }>(url, {
        body: requestBody,
        headers: {
          Accept: 'application/json',
          Authorization: createAuthorizationHeader({
            body: requestBody,
            mchId: config.mchId,
            method: 'POST',
            nonce: requestNonce,
            privateKey: config.privateKey,
            serialNo: config.serialNo,
            timestamp: timeStamp,
            urlPath: '/v3/pay/transactions/jsapi',
          }),
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      if (!prepay.prepay_id || prepay.code) {
        throw new MiniProgramError(prepay.message || '微信支付下单失败', 502)
      }

      const packageValue = `prepay_id=${prepay.prepay_id}`

      return {
        mock: false,
        nonceStr: payNonce,
        orderNo,
        packageValue,
        paySign: createMiniProgramPaySign({
          appId: config.appId,
          nonce: payNonce,
          packageValue,
          privateKey: config.privateKey,
          timestamp: timeStamp,
        }),
        signType: 'RSA',
        timeStamp,
        totalFee: amountCents,
      }
    },
  }
}

export function createPaymentGateway(env: NodeJS.ProcessEnv): PaymentGateway {
  if (env.MINIPROGRAM_MOCK_PAYMENT === 'true') {
    return {
      async createPaymentParams({ amountCents, orderNo }) {
        return {
          mock: true,
          nonceStr: `mock_nonce_${orderNo}`,
          orderNo,
          packageValue: `prepay_id=mock_${orderNo}`,
          paySign: `mock_sign_${orderNo}`,
          signType: 'RSA',
          timeStamp: String(Math.floor(Date.now() / 1000)),
          totalFee: amountCents,
        }
      },
    }
  }

  return createWechatPayGateway({ env })
}
