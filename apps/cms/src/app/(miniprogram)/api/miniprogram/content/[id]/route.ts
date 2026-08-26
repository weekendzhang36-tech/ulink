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
import { requireCompletedStudentProfile } from '@/lib/miniprogram/studentAccess.ts'
import type { MembershipRecord, MiniProgramRepository } from '@/lib/miniprogram/types.ts'

function hasUsableMembership(membership: MembershipRecord | undefined, now: Date) {
  if (!membership || membership.status !== 'active') return false

  return Date.parse(membership.expiresAt) > now.getTime()
}

async function getContentViewer({
  contentId,
  now,
  repository,
  request,
}: {
  contentId: string
  now: Date
  repository: MiniProgramRepository
  request: Request
}) {
  const token = getBearerToken(request)
  const student = await requireCompletedStudentProfile({
    now,
    repository,
    secret: getServerSecret(),
    sessionToken: token,
  })
  const membership = student ? await repository.findMembershipByStudentId(student.id) : undefined
  const reservation = await repository.findContentReservationByStudentAndContent({
    contentId,
    studentId: student.id,
  })

  return {
    hasActiveMembership: hasUsableMembership(membership, now),
    isVerifiedStudent: student.verificationStatus === 'verified',
    reservation,
  }
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
      viewer: await getContentViewer({ contentId: id, now, repository, request }),
    })
    if (!content) {
      throw new MiniProgramError('内容不存在或暂未发布', 404)
    }

    return ok(content)
  })
}
