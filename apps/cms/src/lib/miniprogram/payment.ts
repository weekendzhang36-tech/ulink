import { MiniProgramError } from './errors.ts'
import type { PaymentGateway } from './types.ts'

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
          timeStamp: String(Math.floor(Date.now() / 1000)),
          totalFee: amountCents,
        }
      },
    }
  }

  return {
    async createPaymentParams() {
      throw new MiniProgramError('微信支付尚未配置，请先启用本地 mock 支付或接入真实商户号', 503)
    },
  }
}
