import { MiniProgramError } from './errors.ts'
import { formatMembershipState } from './membership.ts'
import { verifySessionToken } from './session.ts'
import type { MiniProgramRepository } from './types.ts'
import {
  formatVerificationMessageForDisplay,
  formatVerificationStatusForDisplay,
} from './verificationStatusDisplay.ts'

export async function getProfileStatus({
  now,
  repository,
  secret,
  sessionToken,
}: {
  now: Date
  repository: MiniProgramRepository
  secret: string
  sessionToken?: string
}) {
  if (!sessionToken) {
    throw new MiniProgramError('请先登录', 401)
  }

  const session = verifySessionToken({ now, secret, token: sessionToken })
  const student = session.studentId
    ? await repository.findStudentById(session.studentId)
    : await repository.findStudentByOpenId(session.openId)
  const membership = student ? await repository.findMembershipByStudentId(student.id) : undefined
  const instructorClassIds = student
    ? await repository.findInstructorClassIdsByPhone(student.phone)
    : []

  return {
    instructor: {
      canManageStudents: instructorClassIds.length > 0,
      classCount: instructorClassIds.length,
    },
    membershipState: formatMembershipState({ membership, now }),
    profileCompleted: Boolean(student),
    student: student
      ? {
          className: student.classId,
          message: formatVerificationMessageForDisplay(student.verificationStatus),
          name: student.realName,
          school: student.schoolId,
          verificationStatus: formatVerificationStatusForDisplay(student.verificationStatus),
        }
      : null,
  }
}
