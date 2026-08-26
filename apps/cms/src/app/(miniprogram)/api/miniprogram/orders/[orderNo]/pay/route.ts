import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import { resumeMembershipOrderPayment } from '@/lib/miniprogram/membership.ts'
import { createPaymentGateway } from '@/lib/miniprogram/payment.ts'
import {
  getBearerToken,
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
} from '@/lib/miniprogram/routeHelpers.ts'

export async function POST(request: Request, { params }: { params: Promise<{ orderNo: string }> }) {
  return handleMiniProgramRoute(async () => {
    const { orderNo } = await params
    const sessionToken = getBearerToken(request)
    if (!sessionToken) {
      throw new MiniProgramError('请先登录', 401)
    }
    const result = await resumeMembershipOrderPayment({
      input: { orderNo, sessionToken },
      now: new Date(),
      paymentGateway: createPaymentGateway(process.env),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result)
  })
}
