import assert from 'node:assert/strict'
import { createVerify, generateKeyPairSync } from 'node:crypto'
import test from 'node:test'

import { createWechatPayGateway } from './payment.ts'
import type { StudentRecord } from './types.ts'

const student: StudentRecord = {
  birthday: '2007-09-01',
  classId: 'class_001',
  collegeId: 'college_001',
  gender: 'female',
  id: 'student_001',
  majorId: 'major_001',
  phone: '13800000001',
  realName: '林一诺',
  schoolId: 'school_001',
  submittedAt: '2026-08-26T10:00:00.000Z',
  verificationStatus: 'verified',
  wechatOpenId: 'openid_001',
}

test('creates WeChat Pay JSAPI order and signs Mini Program payment params', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const requests: Array<{ body: Record<string, unknown>; headers: Record<string, string>; url: string }> = []
  const now = new Date('2026-08-26T10:00:00.000Z')

  const gateway = createWechatPayGateway({
    env: {
      NODE_ENV: 'test',
      WECHAT_MINIPROGRAM_APP_ID: 'wx_app_001',
      WECHAT_PAY_CERT_SERIAL_NO: 'serial_001',
      WECHAT_PAY_MCH_ID: 'mch_001',
      WECHAT_PAY_NOTIFY_URL: 'https://api.example.com/api/miniprogram/payments/wechat-callback',
      WECHAT_PAY_PRIVATE_KEY: privateKey.export({ format: 'pem', type: 'pkcs8' }).toString(),
    },
    fetchJson: async <T>(url: string, init?: RequestInit) => {
      requests.push({
        body: JSON.parse(String(init?.body || '{}')) as Record<string, unknown>,
        headers: init?.headers as Record<string, string>,
        url,
      })

      return { prepay_id: 'wx_prepay_001' } as T
    },
    nonce: () => 'nonce_001',
    now: () => now,
  })

  const result = await gateway.createPaymentParams({
    amountCents: 500,
    body: '友邻成长计划',
    orderNo: 'UL20260826100000ABC123',
    student,
  })

  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi')
  assert.deepEqual(requests[0].body, {
    amount: {
      currency: 'CNY',
      total: 500,
    },
    appid: 'wx_app_001',
    description: '友邻成长计划',
    mchid: 'mch_001',
    notify_url: 'https://api.example.com/api/miniprogram/payments/wechat-callback',
    out_trade_no: 'UL20260826100000ABC123',
    payer: {
      openid: 'openid_001',
    },
  })
  assert.equal(requests[0].headers.Accept, 'application/json')
  assert.equal(requests[0].headers['Content-Type'], 'application/json')
  assert.match(requests[0].headers.Authorization, /^WECHATPAY2-SHA256-RSA2048 /)
  assert.match(requests[0].headers.Authorization, /mchid="mch_001"/)
  assert.match(requests[0].headers.Authorization, /serial_no="serial_001"/)

  assert.deepEqual(
    {
      mock: result.mock,
      nonceStr: result.nonceStr,
      orderNo: result.orderNo,
      packageValue: result.packageValue,
      signType: result.signType,
      timeStamp: result.timeStamp,
      totalFee: result.totalFee,
    },
    {
      mock: false,
      nonceStr: 'nonce_001',
      orderNo: 'UL20260826100000ABC123',
      packageValue: 'prepay_id=wx_prepay_001',
      signType: 'RSA',
      timeStamp: String(Math.floor(now.getTime() / 1000)),
      totalFee: 500,
    },
  )

  const verifier = createVerify('RSA-SHA256')
  verifier.update(`wx_app_001\n${result.timeStamp}\nnonce_001\nprepay_id=wx_prepay_001\n`)
  verifier.end()
  assert.equal(verifier.verify(publicKey, result.paySign, 'base64'), true)
})
