import { randomBytes } from 'node:crypto'

import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import {
  createMembershipOrder,
  listMembershipOrdersForStudent,
} from '@/lib/miniprogram/membership.ts'
import { createPaymentGateway } from '@/lib/miniprogram/payment.ts'
import {
  getBearerToken,
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

export async function GET(request: Request) {
  return handleMiniProgramRoute(async () => {
    const sessionToken = getBearerToken(request)
    if (!sessionToken) {
      throw new MiniProgramError('请先登录', 401)
    }
    const result = await listMembershipOrdersForStudent({
      input: { sessionToken },
      now: new Date(),
      repository: await getMiniProgramRepository(),
      secret: getServerSecret(),
    })

    return ok(result)
  })
}
