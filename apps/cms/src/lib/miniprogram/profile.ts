import { MiniProgramError, requireValue } from './errors.ts'
import { verifyPhoneVerificationToken } from './phone.ts'
import { createSessionToken, verifySessionToken } from './session.ts'
import type { MiniProgramRepository, StudentProfileInput } from './types.ts'

function changedVerificationFields(existing: {
  classId: string
  collegeId: string
  majorId: string
  realName: string
  schoolId: string
}, input: StudentProfileInput) {
  return (
    existing.realName !== input.realName.trim() ||
    existing.schoolId !== input.schoolId ||
    existing.collegeId !== input.collegeId ||
    existing.majorId !== input.majorId ||
    existing.classId !== input.classId
  )
}

export async function submitStudentProfile({
  input,
  now,
  repository,
  secret,
}: {
  input: StudentProfileInput
  now: Date
  repository: MiniProgramRepository
  secret: string
}) {
  if (!input.agreedToPolicies) {
    throw new MiniProgramError('请先同意用户协议和隐私政策')
  }

  const realName = requireValue(input.realName, '真实姓名')
  const phone = requireValue(input.phone, '手机号')
  const schoolId = requireValue(input.schoolId, '学校')
  const collegeId = requireValue(input.collegeId, '学院')
  const majorId = requireValue(input.majorId, '专业')
  const classId = requireValue(input.classId, '班级')
  const birthday = requireValue(input.birthday, '生日')
  const session = verifySessionToken({ now, secret, token: input.sessionToken })
  verifyPhoneVerificationToken({
    expectedPhone: phone,
    now,
    secret,
    token: input.phoneVerificationToken,
  })

  const phoneOwner = await repository.findStudentByPhone(phone)
  if (phoneOwner && phoneOwner.wechatOpenId !== session.openId) {
    throw new MiniProgramError('手机号已绑定其他学生账号')
  }

  const existing = await repository.findStudentByOpenId(session.openId)
  const submittedAt = now.toISOString()

  const student = existing
    ? await repository.updateStudent(existing.id, {
        birthday,
        classId,
        collegeId,
        gender: input.gender,
        majorId,
        phone,
        realName,
        schoolId,
        submittedAt,
        verificationStatus:
          existing.verificationStatus === 'needs_review' || changedVerificationFields(existing, input)
            ? 'pending'
            : existing.verificationStatus,
      })
    : await repository.createStudent({
        birthday,
        classId,
        collegeId,
        gender: input.gender,
        majorId,
        phone,
        realName,
        schoolId,
        submittedAt,
        verificationStatus: 'pending',
        wechatOpenId: session.openId,
        wechatUnionId: session.unionId,
      })

  return {
    sessionToken: createSessionToken({
      expiresInSeconds: 60 * 60 * 24 * 30,
      now,
      openId: student.wechatOpenId,
      secret,
      studentId: student.id,
      unionId: student.wechatUnionId,
    }),
    student,
  }
}
