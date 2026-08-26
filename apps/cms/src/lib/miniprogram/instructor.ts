import { MiniProgramError } from './errors.ts'
import { verifySessionToken } from './session.ts'
import type { MiniProgramRepository, VerificationStatus } from './types.ts'

const instructorDataUseCommitmentVersion = 'v1'

async function getInstructorContext({
  now,
  repository,
  secret,
  sessionToken,
  requireDataUseCommitment = true,
}: {
  now: Date
  repository: MiniProgramRepository
  secret: string
  sessionToken: string
  requireDataUseCommitment?: boolean
}) {
  const session = verifySessionToken({ now, secret, token: sessionToken })
  const operator = session.studentId
    ? await repository.findStudentById(session.studentId)
    : await repository.findStudentByOpenId(session.openId)
  if (!operator) {
    throw new MiniProgramError('请先完成手机号认证', 401)
  }

  const classIds = await repository.findInstructorClassIdsByPhone(operator.phone)
  if (classIds.length === 0) {
    throw new MiniProgramError('当前账号没有学生认证管理权限', 403)
  }
  const dataUseCommitment = await repository.findInstructorDataUseCommitmentByStudentId(operator.id)
  if (requireDataUseCommitment && !dataUseCommitment) {
    throw new MiniProgramError('请先确认管理端数据使用承诺', 428)
  }

  return { classIds, dataUseCommitment, operator }
}

export async function listInstructorVerificationStudents({
  input,
  now,
  repository,
  secret,
}: {
  input: {
    sessionToken: string
    status?: VerificationStatus
  }
  now: Date
  repository: MiniProgramRepository
  secret: string
}) {
  const { classIds } = await getInstructorContext({
    now,
    repository,
    secret,
    sessionToken: input.sessionToken,
  })
  const [students, pendingStudents] = await Promise.all([
    repository.findStudentsByClassIds({ classIds, status: input.status }),
    repository.findStudentsByClassIds({ classIds, status: 'pending' }),
  ])

  return {
    classIds,
    pendingCount: pendingStudents.length,
    students,
  }
}

export async function confirmInstructorDataUseCommitment({
  input,
  now,
  repository,
  secret,
}: {
  input: {
    sessionToken: string
  }
  now: Date
  repository: MiniProgramRepository
  secret: string
}) {
  const { dataUseCommitment, operator } = await getInstructorContext({
    now,
    repository,
    requireDataUseCommitment: false,
    secret,
    sessionToken: input.sessionToken,
  })
  if (dataUseCommitment) {
    return dataUseCommitment
  }

  return repository.createInstructorDataUseCommitment({
    commitmentVersion: instructorDataUseCommitmentVersion,
    confirmedAt: now.toISOString(),
    phone: operator.phone,
    studentId: operator.id,
  })
}

export async function reviewInstructorStudents({
  input,
  now,
  repository,
  secret,
}: {
  input: {
    action: Extract<VerificationStatus, 'needs_review' | 'verified'>
    sessionToken: string
    studentIds: string[]
  }
  now: Date
  repository: MiniProgramRepository
  secret: string
}) {
  if (input.studentIds.length === 0) {
    throw new MiniProgramError('请选择需要处理的学生')
  }

  const { classIds } = await getInstructorContext({
    now,
    repository,
    secret,
    sessionToken: input.sessionToken,
  })
  const updatedStudents = []

  for (const studentId of input.studentIds) {
    const student = await repository.findStudentById(studentId)
    if (!student || !classIds.includes(student.classId)) {
      throw new MiniProgramError('无权操作该学生', 403)
    }
    updatedStudents.push(await repository.updateStudentVerificationStatus(student.id, input.action))
  }

  return { updatedStudents }
}
