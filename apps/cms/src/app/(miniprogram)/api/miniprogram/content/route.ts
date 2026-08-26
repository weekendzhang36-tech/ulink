import { listPublishedContents } from '@/lib/miniprogram/content.ts'
import { getMiniProgramPayload, handleMiniProgramRoute, ok } from '@/lib/miniprogram/routeHelpers.ts'

export async function GET(request: Request) {
  return handleMiniProgramRoute(async () => {
    const url = new URL(request.url)
    const module = url.searchParams.get('module') || undefined
    const contents = await listPublishedContents({
      module,
      payload: await getMiniProgramPayload(),
    })

    return ok(contents)
  })
}
