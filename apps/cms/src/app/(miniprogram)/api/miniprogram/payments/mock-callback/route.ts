import { confirmMembershipPayment } from '@/lib/miniprogram/membership.ts'
import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import { getMiniProgramRepository, handleMiniProgramRoute, ok, readJson } from '@/lib/miniprogram/routeHelpers.ts'

export async function POST(request: Request) {
  return handleMiniProgramRoute(async () => {
    if (process.env.MINIPROGRAM_MOCK_PAYMENT !== 'true') {
      throw new MiniProgramError('本地模拟支付未启用', 403)
    }
    const body = await readJson<{ orderNo: string }>(request)
    const now = new Date()
    const paidAt = now.toISOString()
    const result = await confirmMembershipPayment({
      input: {
        eventKey: `mock:${body.orderNo}`,
        orderNo: body.orderNo,
        paidAt,
        rawPayload: {
          orderNo: body.orderNo,
          paidAt,
          source: 'mock-payment-callback',
        },
        transactionId: `mock_tx_${body.orderNo}`,
      },
      now,
      repository: await getMiniProgramRepository(),
    })

    return ok(result)
  })
}
