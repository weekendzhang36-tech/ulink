import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import { getMiniProgramRepository, handleMiniProgramRoute, ok } from '@/lib/miniprogram/routeHelpers.ts'

export async function GET(_request: Request, { params }: { params: Promise<{ orderNo: string }> }) {
  return handleMiniProgramRoute(async () => {
    const { orderNo } = await params
    const repository = await getMiniProgramRepository()
    const order = await repository.findOrderByOrderNo(orderNo)
    if (!order) {
      throw new MiniProgramError('订单不存在', 404)
    }
    const membership = await repository.findMembershipByStudentId(order.studentId)

    return ok({ membership, order })
  })
}
