import assert from 'node:assert/strict'
import { createCipheriv, createSign, generateKeyPairSync, randomBytes } from 'node:crypto'
import test from 'node:test'

import { handleWechatPayCallback } from './wechatPayCallback.ts'
import { createMemoryRepository } from './testing/memoryRepository.ts'

const apiV3Key = '0123456789abcdefghijklmnopqrstuv'

function encryptResource(plaintext: Record<string, unknown>) {
  const nonce = randomBytes(12).toString('base64url').slice(0, 12)
  const associatedData = 'transaction'
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(apiV3Key), nonce)
  cipher.setAAD(Buffer.from(associatedData))
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(plaintext), 'utf8'), cipher.final()])
  const ciphertext = Buffer.concat([encrypted, cipher.getAuthTag()]).toString('base64')

  return {
    algorithm: 'AEAD_AES_256_GCM',
    associated_data: associatedData,
    ciphertext,
    nonce,
    original_type: 'transaction',
  }
}

function signCallback(input: { body: string; nonce: string; privateKey: string; timestamp: string }) {
  const signer = createSign('RSA-SHA256')
  signer.update(`${input.timestamp}\n${input.nonce}\n${input.body}\n`)
  signer.end()

  return signer.sign(input.privateKey, 'base64')
}

function signedSuccessCallback(input: {
  privateKey: string
  total: number
  transactionId: string
}) {
  const callbackNonce = 'callback_nonce_001'
  const timestamp = String(Math.floor(new Date('2026-08-26T10:05:00.000Z').getTime() / 1000))
  const body = JSON.stringify({
    create_time: '2026-08-26T10:05:00+08:00',
    event_type: 'TRANSACTION.SUCCESS',
    id: 'callback_001',
    resource: encryptResource({
      amount: {
        currency: 'CNY',
        payer_currency: 'CNY',
        payer_total: input.total,
        total: input.total,
      },
      appid: 'wx_app_001',
      mchid: 'mch_001',
      out_trade_no: 'order_paid_once',
      payer: {
        openid: 'openid_001',
      },
      success_time: '2026-08-26T10:05:00+08:00',
      trade_state: 'SUCCESS',
      trade_type: 'JSAPI',
      transaction_id: input.transactionId,
    }),
    resource_type: 'encrypt-resource',
    summary: '支付成功',
  })

  return {
    body,
    headers: {
      'wechatpay-nonce': callbackNonce,
      'wechatpay-serial': 'platform_serial_001',
      'wechatpay-signature': signCallback({
        body,
        nonce: callbackNonce,
        privateKey: input.privateKey,
        timestamp,
      }),
      'wechatpay-timestamp': timestamp,
    },
  }
}

function callbackEnv(publicKey: string): NodeJS.ProcessEnv {
  return {
    NODE_ENV: 'test',
    WECHAT_MINIPROGRAM_APP_ID: 'wx_app_001',
    WECHAT_PAY_API_V3_KEY: apiV3Key,
    WECHAT_PAY_MCH_ID: 'mch_001',
    WECHAT_PAY_PLATFORM_PUBLIC_KEY: publicKey,
    WECHAT_PAY_PLATFORM_SERIAL_NO: 'platform_serial_001',
  }
}

test('activates membership from a verified WeChat Pay SUCCESS callback', async () => {
  const repository = createMemoryRepository()
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const callback = signedSuccessCallback({
    privateKey: privateKey.export({ format: 'pem', type: 'pkcs8' }).toString(),
    total: 500,
    transactionId: 'wx_tx_callback_001',
  })

  const result = await handleWechatPayCallback({
    env: callbackEnv(publicKey.export({ format: 'pem', type: 'spki' }).toString()),
    headers: callback.headers,
    now: new Date('2026-08-26T10:05:01.000Z'),
    rawBody: callback.body,
    repository,
  })

  assert.equal(result.order.status, 'paid')
  assert.equal(result.order.wechatTransactionId, 'wx_tx_callback_001')
  assert.equal(result.paymentEvent.eventKey, 'wechat:wx_tx_callback_001')
  assert.equal(result.membership.status, 'active')
  assert.equal(repository.paymentEvents.size, 1)
})

test('rejects WeChat Pay SUCCESS callback when paid amount does not match the order', async () => {
  const repository = createMemoryRepository()
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const callback = signedSuccessCallback({
    privateKey: privateKey.export({ format: 'pem', type: 'pkcs8' }).toString(),
    total: 1,
    transactionId: 'wx_tx_callback_amount_mismatch',
  })

  await assert.rejects(
    () =>
      handleWechatPayCallback({
        env: callbackEnv(publicKey.export({ format: 'pem', type: 'spki' }).toString()),
        headers: callback.headers,
        now: new Date('2026-08-26T10:05:01.000Z'),
        rawBody: callback.body,
        repository,
      }),
    /微信支付金额不匹配/,
  )

  assert.equal(repository.orders.get('order_paid_once')?.status, 'pending')
  assert.equal(repository.paymentEvents.size, 0)
  assert.equal(repository.memberships.size, 0)
})
