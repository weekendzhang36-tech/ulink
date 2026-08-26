import assert from 'node:assert/strict'
import test from 'node:test'

import { createWechatSubscribeNotificationGateway } from './notificationDelivery.ts'

test('sends student verification result through WeChat subscribe message API', async () => {
  const requests: Array<{ init?: RequestInit; url: string }> = []
  const gateway = createWechatSubscribeNotificationGateway({
    env: {
      NODE_ENV: 'test',
      WECHAT_MINIPROGRAM_APP_ID: 'wx_app_001',
      WECHAT_MINIPROGRAM_APP_SECRET: 'wx_secret_001',
      WECHAT_SUBSCRIBE_MINIPROGRAM_STATE: 'developer',
      WECHAT_SUBSCRIBE_STUDENT_VERIFICATION_RESULT_FIELDS:
        '{"thing1":"serviceName","phrase2":"statusText","time3":"reviewedAtText","name4":"studentName"}',
    },
    fetchJson: async (url, init) => {
      requests.push({ init, url })
      if (url.startsWith('https://api.weixin.qq.com/cgi-bin/token')) {
        return { access_token: 'access_token_001', expires_in: 7200 } as never
      }

      return { errcode: 0, errmsg: 'ok', msgid: 10001 } as never
    },
  })

  await gateway.sendStudentVerificationResult({
    reviewedAt: '2026-08-26T02:01:00.000Z',
    status: 'needs_review',
    student: {
      birthday: '2007-09-01',
      classId: 'class_001',
      collegeId: 'college_001',
      gender: 'female',
      id: 'student_001',
      majorId: 'major_001',
      phone: '13800000001',
      realName: '林一诺',
      schoolId: 'school_001',
      submittedAt: '2026-08-26T09:00:00.000Z',
      verificationStatus: 'needs_review',
      wechatOpenId: 'openid_001',
    },
    subscription: {
      id: 'subscription_001',
      purpose: 'student_verification_result',
      status: 'active',
      studentId: 'student_001',
      subscribedAt: '2026-08-26T09:30:00.000Z',
      templateId: 'template_student_result',
    },
  })

  assert.equal(requests.length, 2)
  assert.equal(
    requests[0].url,
    'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx_app_001&secret=wx_secret_001',
  )
  assert.equal(
    requests[1].url,
    'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=access_token_001',
  )
  assert.equal(requests[1].init?.method, 'POST')
  assert.deepEqual(JSON.parse(String(requests[1].init?.body)), {
    data: {
      name4: { value: '林一诺' },
      phrase2: { value: '需确认' },
      thing1: { value: 'U Link 学生认证' },
      time3: { value: '2026-08-26 10:01' },
    },
    lang: 'zh_CN',
    miniprogram_state: 'developer',
    page: 'pages/verification/index',
    template_id: 'template_student_result',
    touser: 'openid_001',
  })
})

test('sends instructor pending verification through WeChat subscribe message API', async () => {
  const requests: Array<{ init?: RequestInit; url: string }> = []
  const gateway = createWechatSubscribeNotificationGateway({
    env: {
      NODE_ENV: 'test',
      WECHAT_MINIPROGRAM_APP_ID: 'wx_app_001',
      WECHAT_MINIPROGRAM_APP_SECRET: 'wx_secret_001',
      WECHAT_SUBSCRIBE_INSTRUCTOR_PENDING_VERIFICATION_FIELDS:
        '{"thing1":"serviceName","number2":"pendingCount","time3":"submittedAtText","name4":"studentName"}',
      WECHAT_SUBSCRIBE_MINIPROGRAM_STATE: 'developer',
    },
    fetchJson: async (url, init) => {
      requests.push({ init, url })
      if (url.startsWith('https://api.weixin.qq.com/cgi-bin/token')) {
        return { access_token: 'access_token_001', expires_in: 7200 } as never
      }

      return { errcode: 0, errmsg: 'ok', msgid: 10002 } as never
    },
  })

  await gateway.sendInstructorPendingVerification({
    instructor: {
      birthday: '1990-01-01',
      classId: 'class_staff',
      collegeId: 'college_staff',
      gender: 'undisclosed',
      id: 'student_instructor',
      majorId: 'major_staff',
      phone: '13900000001',
      realName: '指导员',
      schoolId: 'school_001',
      submittedAt: '2026-08-26T08:00:00.000Z',
      verificationStatus: 'verified',
      wechatOpenId: 'openid_instructor',
    },
    pendingCount: 3,
    student: {
      birthday: '2007-09-01',
      classId: 'class_001',
      collegeId: 'college_001',
      gender: 'female',
      id: 'student_001',
      majorId: 'major_001',
      phone: '13800000001',
      realName: '林一诺',
      schoolId: 'school_001',
      submittedAt: '2026-08-26T10:01:00.000Z',
      verificationStatus: 'pending',
      wechatOpenId: 'openid_001',
    },
    submittedAt: '2026-08-26T02:01:00.000Z',
    subscription: {
      id: 'subscription_instructor_001',
      purpose: 'instructor_pending_verification',
      status: 'active',
      studentId: 'student_instructor',
      subscribedAt: '2026-08-26T09:30:00.000Z',
      templateId: 'template_instructor_pending',
    },
  })

  assert.equal(requests.length, 2)
  assert.equal(
    requests[1].url,
    'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=access_token_001',
  )
  assert.deepEqual(JSON.parse(String(requests[1].init?.body)), {
    data: {
      name4: { value: '林一诺' },
      number2: { value: '3' },
      thing1: { value: 'U Link 学生认证' },
      time3: { value: '2026-08-26 10:01' },
    },
    lang: 'zh_CN',
    miniprogram_state: 'developer',
    page: 'pages/instructor-verifications/index',
    template_id: 'template_instructor_pending',
    touser: 'openid_instructor',
  })
})
