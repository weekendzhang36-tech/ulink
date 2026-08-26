import { listPublishedContents } from './content.ts'
import { findActiveGrowthPlanForMiniProgram } from './growthPlan.ts'
import { formatMembershipState } from './membership.ts'
import { requireCompletedStudentProfile } from './studentAccess.ts'
import type { MiniProgramRepository } from './types.ts'
import {
  formatVerificationMessageForDisplay,
  formatVerificationStatusForDisplay,
} from './verificationStatusDisplay.ts'

type PayloadLike = {
  find(input: Record<string, unknown>): Promise<{ docs: unknown[] }>
  findByID(input: Record<string, unknown>): Promise<unknown>
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
  const student = await requireCompletedStudentProfile({ now, repository, secret, sessionToken })
  const growthPlan = await findActiveGrowthPlanForMiniProgram({ payload })
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
    growthPlan,
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
      message: formatVerificationMessageForDisplay(student.verificationStatus),
      name: student.realName,
      school: student.schoolId,
      verificationStatus: formatVerificationStatusForDisplay(student.verificationStatus),
    },
  }
}
