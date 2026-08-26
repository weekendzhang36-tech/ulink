import { listPublishedContents } from '@/lib/miniprogram/content.ts'
import {
  getBearerToken,
  getMiniProgramPayload,
  getMiniProgramRepository,
  getServerSecret,
  handleMiniProgramRoute,
  ok,
} from '@/lib/miniprogram/routeHelpers.ts'
import { verifySessionToken } from '@/lib/miniprogram/session.ts'

const modules = [
  { key: 'career_planning', title: '职业规划', summary: '测评、规划、简历与课程支持' },
  { key: 'practice', title: '实习实践', summary: '实训营、岗位介绍与实践机会' },
  { key: 'finance_foundation', title: '金融底色', summary: '金融沙龙、财商课与机构资源' },
  { key: 'culture_exchange', title: '文化交流', summary: '非遗文化、中外交流与研学路线' },
]

export async function GET(request: Request) {
  return handleMiniProgramRoute(async () => {
    const payload = await getMiniProgramPayload()
    const repository = await getMiniProgramRepository()
    const growthPlans = await payload.find({
      collection: 'growth-plans',
      limit: 1,
      where: { isActive: { equals: true } },
    })
    const articles = await listPublishedContents({ featuredOnly: true, payload })
    const token = getBearerToken(request)
    const session = token
      ? verifySessionToken({ now: new Date(), secret: getServerSecret(), token })
      : undefined
    const student = session?.studentId
      ? await repository.findStudentById(session.studentId)
      : session?.openId
        ? await repository.findStudentByOpenId(session.openId)
        : undefined
    const instructorClassIds = student
      ? await repository.findInstructorClassIdsByPhone(student.phone)
      : []
    const pendingStudents =
      instructorClassIds.length > 0
        ? await repository.findStudentsByClassIds({
            classIds: instructorClassIds,
            status: 'pending',
          })
        : []

    return ok({
      articles,
      growthPlan: growthPlans.docs[0] || null,
      instructorState:
        pendingStudents.length > 0
          ? {
              pendingCount: pendingStudents.length,
            }
          : null,
      modules,
      studentState: student
        ? {
            className: student.classId,
            message:
              student.verificationStatus === 'verified'
                ? '资料已认证，可以继续查看成长服务。'
                : '资料已提交，等待指导员确认。',
            name: student.realName,
            school: student.schoolId,
            verificationStatus:
              student.verificationStatus === 'needs_review' ? '需确认' : student.verificationStatus,
          }
        : null,
    })
  })
}
