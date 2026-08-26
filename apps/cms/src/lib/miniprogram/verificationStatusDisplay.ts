import type { VerificationStatus } from './types.ts'

export function formatVerificationStatusForDisplay(status: VerificationStatus) {
  if (status === 'verified') {
    return '已认证'
  }

  if (status === 'needs_review') {
    return '需确认'
  }

  return '待认证'
}

export function formatVerificationMessageForDisplay(status: VerificationStatus) {
  if (status === 'verified') {
    return '资料已认证，可以继续查看成长服务。'
  }

  if (status === 'needs_review') {
    return '资料需要确认，请检查姓名、学院、专业和班级后重新提交。'
  }

  return '资料已提交，等待指导员确认。'
}
