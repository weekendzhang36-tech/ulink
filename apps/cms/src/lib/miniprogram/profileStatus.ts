import { MiniProgramError } from './errors.ts'
import { formatMembershipState } from './membership.ts'
import { verifySessionToken } from './session.ts'
import type { MiniProgramRepository, StudentRecord } from './types.ts'
import { formatVerificationStatusForDisplay } from './verificationStatusDisplay.ts'

function verificationMessage(student: StudentRecord) {
  if (student.verificationStatus === 'verified') {
    return '资料已认证，可以继续查看成长服务。'
  }
  if (student.verificationStatus === 'needs_review') {
    return '资料需要确认，请检查姓名、学院、专业和班级后重新提交。'
  }

  return '资料已提交，等待指导员确认。'
}

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
          message: verificationMessage(student),
          name: student.realName,
          school: student.schoolId,
          verificationStatus: formatVerificationStatusForDisplay(student.verificationStatus),
        }
      : null,
  }
}
