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
