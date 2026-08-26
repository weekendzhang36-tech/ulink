import { MiniProgramError } from './errors.ts'
import type { NotificationGateway } from './types.ts'

type FetchJson = <T>(url: string, init?: RequestInit) => Promise<T>
type InstructorPendingVerificationField =
  | 'pendingCount'
  | 'remark'
  | 'serviceName'
  | 'studentName'
  | 'submittedAtText'
type StudentVerificationResultField =
  | 'remark'
  | 'reviewedAtText'
  | 'serviceName'
  | 'statusText'
  | 'studentName'
type InstructorPendingVerificationInput = Parameters<
  NotificationGateway['sendInstructorPendingVerification']
>[0]
type StudentVerificationResultInput = Parameters<
  NotificationGateway['sendStudentVerificationResult']
>[0]

const allowedInstructorPendingVerificationFields = new Set<InstructorPendingVerificationField>([
  'pendingCount',
  'remark',
  'serviceName',
  'studentName',
  'submittedAtText',
])
const allowedStudentVerificationResultFields = new Set<StudentVerificationResultField>([
  'remark',
  'reviewedAtText',
  'serviceName',
  'statusText',
  'studentName',
])

async function defaultFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new MiniProgramError('微信订阅消息接口请求失败', 502)
  }

  return (await response.json()) as T
}

function formatChinaDateTime(value: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) {
    return value
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') {
        acc[part.type] = part.value
      }

      return acc
    }, {})

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`
}

function trimForWechat(value: string, maxLength: number) {
  return Array.from(value).slice(0, maxLength).join('')
}

function parseFieldMap<T extends string>({
  allowedFields,
  label,
  raw,
}: {
  allowedFields: Set<T>
  label: string
  raw: string
}) {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new MiniProgramError(`${label}订阅消息字段映射不是合法 JSON`, 500)
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new MiniProgramError(`${label}订阅消息字段映射格式不正确`, 500)
  }

  return Object.entries(parsed).reduce<Record<string, T>>((acc, [wechatField, sourceField]) => {
    if (typeof sourceField !== 'string' || !allowedFields.has(sourceField as T)) {
      throw new MiniProgramError(`${label}订阅消息字段映射包含不支持的字段`, 500)
    }
    acc[wechatField] = sourceField as T

    return acc
  }, {})
}

function buildWechatData<T extends string>({
  fieldMap,
  values,
}: {
  fieldMap: Record<string, T>
  values: Record<T, string>
}) {
  return Object.entries(fieldMap).reduce<Record<string, { value: string }>>(
    (acc, [wechatField, sourceField]) => {
      acc[wechatField] = { value: values[sourceField] }

      return acc
    },
    {},
  )
}

function buildStudentVerificationResultValues(input: StudentVerificationResultInput) {
  return {
    remark: input.status === 'verified' ? '认证已完成' : '请检查资料后重新提交',
    reviewedAtText: formatChinaDateTime(input.reviewedAt),
    serviceName: 'U Link 学生认证',
    statusText: input.status === 'verified' ? '已通过' : '需确认',
    studentName: trimForWechat(input.student.realName, 10),
  }
}

function buildInstructorPendingVerificationValues(input: InstructorPendingVerificationInput) {
  return {
    pendingCount: String(input.pendingCount),
    remark: '有新的学生资料待确认',
    serviceName: 'U Link 学生认证',
    studentName: trimForWechat(input.student.realName, 10),
    submittedAtText: formatChinaDateTime(input.submittedAt),
  }
}

async function getAccessToken({
  appId,
  appSecret,
  fetchJson,
}: {
  appId: string
  appSecret: string
  fetchJson: FetchJson
}) {
  const url = new URL('https://api.weixin.qq.com/cgi-bin/token')
  url.searchParams.set('grant_type', 'client_credential')
  url.searchParams.set('appid', appId)
  url.searchParams.set('secret', appSecret)
  const result = await fetchJson<{
    access_token?: string
    errcode?: number
    errmsg?: string
    expires_in?: number
  }>(url.toString())
  if (result.errcode || !result.access_token) {
    throw new MiniProgramError(result.errmsg || '微信 access_token 获取失败', 502)
  }

  return result.access_token
}

export function createWechatSubscribeNotificationGateway({
  env,
  fetchJson = defaultFetchJson,
}: {
  env: NodeJS.ProcessEnv
  fetchJson?: FetchJson
}): NotificationGateway {
  const appId = env.WECHAT_MINIPROGRAM_APP_ID || ''
  const appSecret = env.WECHAT_MINIPROGRAM_APP_SECRET || ''
  const studentVerificationResultFieldMap = env.WECHAT_SUBSCRIBE_STUDENT_VERIFICATION_RESULT_FIELDS
    ? parseFieldMap({
        allowedFields: allowedStudentVerificationResultFields,
        label: '学生认证结果',
        raw: env.WECHAT_SUBSCRIBE_STUDENT_VERIFICATION_RESULT_FIELDS,
      })
    : undefined
  const instructorPendingVerificationFieldMap = env.WECHAT_SUBSCRIBE_INSTRUCTOR_PENDING_VERIFICATION_FIELDS
    ? parseFieldMap({
        allowedFields: allowedInstructorPendingVerificationFields,
        label: '指导员待认证提醒',
        raw: env.WECHAT_SUBSCRIBE_INSTRUCTOR_PENDING_VERIFICATION_FIELDS,
      })
    : undefined

  return {
    async sendInstructorPendingVerification(input) {
      if (!instructorPendingVerificationFieldMap) {
        throw new MiniProgramError('指导员待认证提醒订阅消息字段映射未配置', 500)
      }

      const accessToken = await getAccessToken({ appId, appSecret, fetchJson })
      const data = buildWechatData({
        fieldMap: instructorPendingVerificationFieldMap,
        values: buildInstructorPendingVerificationValues(input),
      })
      const url = new URL('https://api.weixin.qq.com/cgi-bin/message/subscribe/send')
      url.searchParams.set('access_token', accessToken)
      const result = await fetchJson<{ errcode?: number; errmsg?: string; msgid?: number }>(
        url.toString(),
        {
          body: JSON.stringify({
            data,
            lang: 'zh_CN',
            miniprogram_state: env.WECHAT_SUBSCRIBE_MINIPROGRAM_STATE || 'formal',
            page:
              env.WECHAT_SUBSCRIBE_INSTRUCTOR_PENDING_VERIFICATION_PAGE ||
              'pages/instructor-verifications/index',
            template_id: input.subscription.templateId,
            touser: input.instructor.wechatOpenId,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      )
      if (result.errcode) {
        throw new MiniProgramError(result.errmsg || '微信订阅消息发送失败', 502)
      }
    },
    async sendStudentVerificationResult(input) {
      if (!studentVerificationResultFieldMap) {
        throw new MiniProgramError('学生认证结果订阅消息字段映射未配置', 500)
      }

      const accessToken = await getAccessToken({ appId, appSecret, fetchJson })
      const data = buildWechatData({
        fieldMap: studentVerificationResultFieldMap,
        values: buildStudentVerificationResultValues(input),
      })
      const url = new URL('https://api.weixin.qq.com/cgi-bin/message/subscribe/send')
      url.searchParams.set('access_token', accessToken)
      const result = await fetchJson<{ errcode?: number; errmsg?: string; msgid?: number }>(
        url.toString(),
        {
          body: JSON.stringify({
            data,
            lang: 'zh_CN',
            miniprogram_state: env.WECHAT_SUBSCRIBE_MINIPROGRAM_STATE || 'formal',
            page: env.WECHAT_SUBSCRIBE_STUDENT_VERIFICATION_RESULT_PAGE || 'pages/verification/index',
            template_id: input.subscription.templateId,
            touser: input.student.wechatOpenId,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      )
      if (result.errcode) {
        throw new MiniProgramError(result.errmsg || '微信订阅消息发送失败', 502)
      }
    },
  }
}

export function createNotificationGateway(env: NodeJS.ProcessEnv): NotificationGateway | undefined {
  if (
    !env.WECHAT_MINIPROGRAM_APP_ID ||
    !env.WECHAT_MINIPROGRAM_APP_SECRET ||
    (!env.WECHAT_SUBSCRIBE_STUDENT_VERIFICATION_RESULT_FIELDS &&
      !env.WECHAT_SUBSCRIBE_INSTRUCTOR_PENDING_VERIFICATION_FIELDS)
  ) {
    return undefined
  }

  return createWechatSubscribeNotificationGateway({ env })
}
