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
  assert.deepEqual(
    createClassFilterOptions([
      { id: 'class_001', name: '金融学 2026-1 班' },
      { id: 'class_999', name: '金融学 2026-9 班' },
    ]),
    [
      { label: '全部班级', value: '' },
      { label: '金融学 2026-1 班', value: 'class_001' },
      { label: '金融学 2026-9 班', value: 'class_999' },
    ],
  )
})

test('formats instructor verification student status labels for display', () => {
  assert.equal(statusFilters[0].label, '全部')
  assert.equal(
    formatInstructorVerificationStudent({
      classId: 'class_001',
      className: '金融学 2026-1 班',
      collegeId: 'college_001',
      collegeName: '金融学院',
      id: 'student_001',
      majorId: 'major_001',
      majorName: '金融学',
      schoolId: 'school_001',
      schoolName: '广东金融学院',
      submittedAt: '2026-08-26T09:00:00.000Z',
      verificationStatus: 'pending',
    }).statusLabel,
    '待认证',
  )
  assert.equal(
    formatInstructorVerificationStudent({
      classId: 'class_001',
      collegeId: 'college_001',
      id: 'student_001',
      majorId: 'major_001',
      schoolId: 'school_001',
      submittedAt: '2026-08-26T09:00:00.000Z',
      verificationStatus: 'pending',
    }).classText,
    'class_001',
  )
  assert.deepEqual(
    formatInstructorVerificationStudent({
      classId: 'class_001',
      className: '金融学 2026-1 班',
      collegeId: 'college_001',
      collegeName: '金融学院',
      id: 'student_001',
      majorId: 'major_001',
      majorName: '金融学',
      schoolId: 'school_001',
      schoolName: '广东金融学院',
      submittedAt: '2026-08-26T09:00:00.000Z',
      verificationStatus: 'pending',
    }),
    {
      classId: 'class_001',
      className: '金融学 2026-1 班',
      classText: '金融学 2026-1 班',
      collegeId: 'college_001',
      collegeName: '金融学院',
      collegeText: '金融学院',
      id: 'student_001',
      majorId: 'major_001',
      majorName: '金融学',
      majorText: '金融学',
      schoolId: 'school_001',
      schoolName: '广东金融学院',
      schoolText: '广东金融学院',
      statusLabel: '待认证',
      submittedAt: '2026-08-26T09:00:00.000Z',
      submittedAtText: '2026-08-26 09:00',
      verificationStatus: 'pending',
    },
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
