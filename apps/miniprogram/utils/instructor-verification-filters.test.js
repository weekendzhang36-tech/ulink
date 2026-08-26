const assert = require('node:assert/strict')
const test = require('node:test')

const {
  buildInstructorVerificationQuery,
  createClassFilterOptions,
  formatInstructorVerificationStudent,
  statusFilters,
} = require('./instructor-verification-filters')

test('builds instructor verification query from selected filters', () => {
  assert.equal(
    buildInstructorVerificationQuery({ classId: 'class_001', status: 'pending' }),
    '?status=pending&classId=class_001',
  )
  assert.equal(buildInstructorVerificationQuery({ classId: '', status: '' }), '')
  assert.equal(
    buildInstructorVerificationQuery({ classId: '金融 1 班', status: 'needs_review' }),
    '?status=needs_review&classId=%E9%87%91%E8%9E%8D+1+%E7%8F%AD',
  )
})

test('creates class filter options with an all-classes option first', () => {
  assert.deepEqual(createClassFilterOptions(['class_001', 'class_999']), [
    { label: '全部班级', value: '' },
    { label: 'class_001', value: 'class_001' },
    { label: 'class_999', value: 'class_999' },
  ])
})

test('formats instructor verification student status labels for display', () => {
  assert.equal(statusFilters[0].label, '全部')
  assert.equal(
    formatInstructorVerificationStudent({ id: 'student_001', verificationStatus: 'pending' })
      .statusLabel,
    '待认证',
  )
  assert.equal(
    formatInstructorVerificationStudent({ id: 'student_002', verificationStatus: 'verified' })
      .statusLabel,
    '已认证',
  )
  assert.equal(
    formatInstructorVerificationStudent({ id: 'student_003', verificationStatus: 'needs_review' })
      .statusLabel,
    '需确认',
  )
})
