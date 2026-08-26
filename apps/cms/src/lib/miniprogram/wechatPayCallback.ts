import { createDecipheriv, createVerify } from 'node:crypto'

import { MiniProgramError, requireValue } from './errors.ts'
import { confirmMembershipPayment } from './membership.ts'
import type { MiniProgramRepository } from './types.ts'

type WechatPayCallbackHeaders = {
  'wechatpay-nonce'?: string
  'wechatpay-serial'?: string
  'wechatpay-signature'?: string
  'wechatpay-timestamp'?: string
}

type WechatPayEncryptedResource = {
  algorithm: string
  associated_data?: string
  ciphertext: string
  nonce: string
  original_type?: string
}

type WechatPayCallbackBody = {
  id?: string
  resource?: WechatPayEncryptedResource
}

type WechatPayTransaction = {
  amount?: {
    total?: number
  }
  appid?: string
  mchid?: string
  out_trade_no?: string
  success_time?: string
  trade_state?: string
  transaction_id?: string
}

function normalizePublicKey(publicKey: string) {
  return publicKey.replace(/\\n/g, '\n')
}

function requireWechatPayCallbackEnv(env: NodeJS.ProcessEnv) {
  const apiV3Key = env.WECHAT_PAY_API_V3_KEY
  const appId = env.WECHAT_MINIPROGRAM_APP_ID
  const mchId = env.WECHAT_PAY_MCH_ID
  const platformPublicKey = env.WECHAT_PAY_PLATFORM_PUBLIC_KEY
  const platformSerialNo = env.WECHAT_PAY_PLATFORM_SERIAL_NO
  if (!apiV3Key || !appId || !mchId || !platformPublicKey || !platformSerialNo) {
    throw new MiniProgramError('微信支付回调尚未配置', 503)
  }
  if (Buffer.byteLength(apiV3Key) !== 32) {
    throw new MiniProgramError('微信支付 APIv3 密钥长度不正确', 500)
  }

  return { apiV3Key, appId, mchId, platformPublicKey, platformSerialNo }
}

function verifyWechatPaySignature({
  headers,
  platformPublicKey,
  platformSerialNo,
  rawBody,
}: {
  headers: WechatPayCallbackHeaders
  platformPublicKey: string
  platformSerialNo: string
  rawBody: string
}) {
  const nonce = requireValue(headers['wechatpay-nonce'], '微信支付回调随机串')
  const serial = requireValue(headers['wechatpay-serial'], '微信支付回调证书序列号')
  const signature = requireValue(headers['wechatpay-signature'], '微信支付回调签名')
  const timestamp = requireValue(headers['wechatpay-timestamp'], '微信支付回调时间戳')
  if (serial !== platformSerialNo) {
    throw new MiniProgramError('微信支付回调证书序列号不匹配', 401)
  }

  const verifier = createVerify('RSA-SHA256')
  verifier.update(`${timestamp}\n${nonce}\n${rawBody}\n`)
  verifier.end()
  if (!verifier.verify(normalizePublicKey(platformPublicKey), signature, 'base64')) {
    throw new MiniProgramError('微信支付回调签名无效', 401)
  }
}

function decryptWechatPayResource(resource: WechatPayEncryptedResource, apiV3Key: string) {
  if (resource.algorithm !== 'AEAD_AES_256_GCM') {
    throw new MiniProgramError('微信支付回调加密算法不支持', 400)
  }

  try {
    const encrypted = Buffer.from(resource.ciphertext, 'base64')
    const ciphertext = encrypted.subarray(0, encrypted.length - 16)
    const authTag = encrypted.subarray(encrypted.length - 16)
    const decipher = createDecipheriv('aes-256-gcm', Buffer.from(apiV3Key), resource.nonce)
    if (resource.associated_data) {
      decipher.setAAD(Buffer.from(resource.associated_data))
    }
    decipher.setAuthTag(authTag)

    return JSON.parse(
      Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'),
    ) as WechatPayTransaction
  } catch {
    throw new MiniProgramError('微信支付回调解密失败', 400)
  }
}

function parseCallbackBody(rawBody: string) {
  try {
    return JSON.parse(rawBody) as WechatPayCallbackBody
  } catch {
    throw new MiniProgramError('微信支付回调 JSON 格式不正确', 400)
  }
}

function validateTransaction(transaction: WechatPayTransaction, env: { appId: string; mchId: string }) {
  const appId = requireValue(transaction.appid, '微信支付回调 AppID')
  const mchId = requireValue(transaction.mchid, '微信支付回调商户号')
  const orderNo = requireValue(transaction.out_trade_no, '微信支付回调订单号')
  const successTime = requireValue(transaction.success_time, '微信支付成功时间')
  const transactionId = requireValue(transaction.transaction_id, '微信支付交易号')
  if (appId !== env.appId || mchId !== env.mchId) {
    throw new MiniProgramError('微信支付回调商户信息不匹配', 401)
  }
  if (transaction.trade_state !== 'SUCCESS') {
    throw new MiniProgramError('微信支付回调不是成功状态', 409)
  }

  return {
    amountCents: transaction.amount?.total,
    orderNo,
    paidAt: new Date(successTime).toISOString(),
    transactionId,
  }
}

export async function handleWechatPayCallback({
  env,
  headers,
  now,
  rawBody,
  repository,
}: {
  env: NodeJS.ProcessEnv
  headers: WechatPayCallbackHeaders
  now: Date
  rawBody: string
  repository: MiniProgramRepository
}) {
  const config = requireWechatPayCallbackEnv(env)
  verifyWechatPaySignature({
    headers,
    platformPublicKey: config.platformPublicKey,
    platformSerialNo: config.platformSerialNo,
    rawBody,
  })

  const body = parseCallbackBody(rawBody)
  if (!body.resource) {
    throw new MiniProgramError('微信支付回调缺少资源数据', 400)
  }

  const transaction = decryptWechatPayResource(body.resource, config.apiV3Key)
  const payment = validateTransaction(transaction, config)
  const order = await repository.findOrderByOrderNo(payment.orderNo)
  if (!order) {
    throw new MiniProgramError('订单不存在', 404)
  }
  if (order.amountCents !== payment.amountCents) {
    throw new MiniProgramError('微信支付金额不匹配', 409)
  }

  return confirmMembershipPayment({
    input: {
      eventKey: `wechat:${payment.transactionId}`,
      orderNo: payment.orderNo,
      paidAt: payment.paidAt,
      rawPayload: {
        body,
        decryptedResource: transaction,
        headers,
        rawBody,
      },
      transactionId: payment.transactionId,
    },
    now,
    repository,
  })
}
