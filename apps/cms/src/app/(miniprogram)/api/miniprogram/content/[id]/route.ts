import { getPublishedContentDetail } from '@/lib/miniprogram/content.ts'
import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import { createPayloadRepository } from '@/lib/miniprogram/payloadRepository.ts'
import {
  getBearerToken,
  getMiniProgramPayload,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
} from '@/lib/miniprogram/routeHelpers.ts'
import { verifySessionToken } from '@/lib/miniprogram/session.ts'
import type { MembershipRecord, MiniProgramRepository } from '@/lib/miniprogram/types.ts'

function hasUsableMembership(membership: MembershipRecord | undefined, now: Date) {
  if (!membership || membership.status !== 'active') return false

  return Date.parse(membership.expiresAt) > now.getTime()
}

async function getContentViewer({
  now,
  repository,
  request,
}: {
  now: Date
  repository: MiniProgramRepository
  request: Request
}) {
  const token = getBearerToken(request)
  if (!token) {
    return { hasActiveMembership: false }
  }

  const session = verifySessionToken({ now, secret: getServerSecret(), token })
  const student = session.studentId
    ? await repository.findStudentById(session.studentId)
    : await repository.findStudentByOpenId(session.openId)
  const membership = student ? await repository.findMembershipByStudentId(student.id) : undefined

  return { hasActiveMembership: hasUsableMembership(membership, now) }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleMiniProgramRoute(async () => {
    const { id } = await params
    const now = new Date()
    const payload = await getMiniProgramPayload()
    const repository = createPayloadRepository(payload)
    const content = await getPublishedContentDetail({
      id,
      payload,
      viewer: await getContentViewer({ now, repository, request }),
    })
    if (!content) {
      throw new MiniProgramError('内容不存在或暂未发布', 404)
    }

    return ok(content)
  })
}
