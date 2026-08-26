import { MiniProgramError } from './errors.ts'
import { verifySessionToken } from './session.ts'
import type { MiniProgramRepository } from './types.ts'

export async function requireCompletedStudentProfile({
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
  if (!student) {
    throw new MiniProgramError('请先完善学生资料', 403)
  }

  return student
}
