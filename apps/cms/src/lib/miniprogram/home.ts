import { listPublishedContents } from './content.ts'
import { MiniProgramError } from './errors.ts'
import { formatMembershipState } from './membership.ts'
import { verifySessionToken } from './session.ts'
import type { MiniProgramRepository } from './types.ts'
import { formatVerificationStatusForDisplay } from './verificationStatusDisplay.ts'

type PayloadLike = {
  find(input: Record<string, unknown>): Promise<{ docs: Record<string, unknown>[] }>
  findByID(input: Record<string, unknown>): Promise<Record<string, unknown>>
}

const modules = [
  { key: 'career_planning', title: '职业规划', summary: '测评、规划、简历与课程支持' },
  { key: 'practice', title: '实习实践', summary: '实训营、岗位介绍与实践机会' },
  { key: 'finance_foundation', title: '金融底色', summary: '金融沙龙、财商课与机构资源' },
  { key: 'culture_exchange', title: '文化交流', summary: '非遗文化、中外交流与研学路线' },
]

export async function getMiniProgramHomeData({
  now,
  payload,
  repository,
  secret,
  sessionToken,
}: {
  now: Date
  payload: PayloadLike
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
  if (!student) {
    throw new MiniProgramError('请先完善学生资料', 403)
  }

  const growthPlans = await payload.find({
    collection: 'growth-plans',
    limit: 1,
    where: { isActive: { equals: true } },
  })
  const articles = await listPublishedContents({ featuredOnly: true, payload })
  const instructorClassIds = await repository.findInstructorClassIdsByPhone(student.phone)
  const pendingStudents =
    instructorClassIds.length > 0
      ? await repository.findStudentsByClassIds({
          classIds: instructorClassIds,
          status: 'pending',
        })
      : []
  const membership = await repository.findMembershipByStudentId(student.id)

  return {
    articles,
    growthPlan: growthPlans.docs[0] || null,
    instructorState:
      pendingStudents.length > 0
        ? {
            pendingCount: pendingStudents.length,
          }
        : null,
    modules,
    studentState: {
      className: student.classId,
      membershipState: formatMembershipState({ membership, now }),
      message:
        student.verificationStatus === 'verified'
          ? '资料已认证，可以继续查看成长服务。'
          : '资料已提交，等待指导员确认。',
      name: student.realName,
      school: student.schoolId,
      verificationStatus: formatVerificationStatusForDisplay(student.verificationStatus),
    },
  }
}
