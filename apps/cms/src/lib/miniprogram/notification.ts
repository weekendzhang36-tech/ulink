import { MiniProgramError, requireValue } from './errors.ts'
import { verifySessionToken } from './session.ts'
import type {
  MiniProgramRepository,
  NotificationSubscriptionPurpose,
} from './types.ts'

const supportedPurposes = new Set<NotificationSubscriptionPurpose>([
  'student_verification_result',
  'instructor_pending_verification',
])

function parsePurpose(value: string): NotificationSubscriptionPurpose {
  if (supportedPurposes.has(value as NotificationSubscriptionPurpose)) {
    return value as NotificationSubscriptionPurpose
  }

  throw new MiniProgramError('提醒类型不支持')
}

export async function recordNotificationSubscription({
  input,
  now,
  repository,
  secret,
}: {
  input: {
    purpose: string
    sessionToken?: string
    templateId: string
  }
  now: Date
  repository: MiniProgramRepository
  secret: string
}) {
  const sessionToken = requireValue(input.sessionToken, '登录状态')
  const purpose = parsePurpose(requireValue(input.purpose, '提醒类型'))
  const templateId = requireValue(input.templateId, '订阅消息模板')
  const session = verifySessionToken({ now, secret, token: sessionToken })
  const student = session.studentId
    ? await repository.findStudentById(session.studentId)
    : await repository.findStudentByOpenId(session.openId)

  if (!student) {
    throw new MiniProgramError('请先完善学生资料', 403)
  }

  const subscribedAt = now.toISOString()
  const existing = await repository.findNotificationSubscriptionByStudentAndPurpose({
    purpose,
    studentId: student.id,
  })
  const subscription = existing
    ? await repository.updateNotificationSubscription(existing.id, {
        status: 'active',
        subscribedAt,
        templateId,
      })
    : await repository.createNotificationSubscription({
        purpose,
        status: 'active',
        studentId: student.id,
        subscribedAt,
        templateId,
      })

  return { subscription }
}
