import { randomBytes } from 'node:crypto'

import { createMembershipOrder } from '@/lib/miniprogram/membership.ts'
import { createPaymentGateway } from '@/lib/miniprogram/payment.ts'
import {
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
  readJson,
} from '@/lib/miniprogram/routeHelpers.ts'

export async function POST(request: Request) {
  return handleMiniProgramRoute(async () => {
    const body = await readJson<{ growthPlanId: string; sessionToken: string }>(request)
    const result = await createMembershipOrder({
      input: body,
      now: new Date(),
      paymentGateway: createPaymentGateway(process.env),
      randomSuffix: () => randomBytes(3).toString('hex').toUpperCase(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result, 201)
  })
}
