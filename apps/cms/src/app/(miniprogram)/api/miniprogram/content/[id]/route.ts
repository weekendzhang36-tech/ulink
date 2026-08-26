import { getPublishedContentDetail } from '@/lib/miniprogram/content.ts'
import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import { getMiniProgramPayload, handleMiniProgramRoute, ok } from '@/lib/miniprogram/routeHelpers.ts'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleMiniProgramRoute(async () => {
    const { id } = await params
    const content = await getPublishedContentDetail({
      id,
      payload: await getMiniProgramPayload(),
    })
    if (!content) {
      throw new MiniProgramError('内容不存在或暂未发布', 404)
    }

    return ok(content)
  })
}
