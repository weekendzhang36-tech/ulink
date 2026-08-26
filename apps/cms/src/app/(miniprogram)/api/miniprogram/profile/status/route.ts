import { formatMembershipState } from '@/lib/miniprogram/membership.ts'
import {
  getMiniProgramRepository,
  getSessionFromRequest,
  handleMiniProgramRoute,
  ok,
} from '@/lib/miniprogram/routeHelpers.ts'

export async function GET(request: Request) {
  return handleMiniProgramRoute(async () => {
    const now = new Date()
    const session = getSessionFromRequest(request)
    const repository = await getMiniProgramRepository()
    const student = session.studentId
      ? await repository.findStudentById(session.studentId)
      : await repository.findStudentByOpenId(session.openId)
    const membership = student ? await repository.findMembershipByStudentId(student.id) : undefined
    const instructorClassIds = student
      ? await repository.findInstructorClassIdsByPhone(student.phone)
      : []

    return ok({
      instructor: {
        canManageStudents: instructorClassIds.length > 0,
        classCount: instructorClassIds.length,
      },
      membership,
      membershipState: formatMembershipState({ membership, now }),
      profileCompleted: Boolean(student),
      student,
    })
  })
}
