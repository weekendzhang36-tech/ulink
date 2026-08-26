const statusFilters = [
  { label: '全部', value: '' },
  { label: '待认证', value: 'pending' },
  { label: '已认证', value: 'verified' },
  { label: '需确认', value: 'needs_review' },
]

function buildInstructorVerificationQuery(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.classId) params.set('classId', filters.classId)

  const query = params.toString()
  return query ? `?${query}` : ''
}

function createClassFilterOptions(classIds = []) {
  return [
    { label: '全部班级', value: '' },
    ...classIds.map((classOption) => ({
      label:
        classOption && typeof classOption === 'object'
          ? classOption.name || classOption.id
          : classOption,
      value:
        classOption && typeof classOption === 'object'
          ? classOption.id
          : classOption,
    })),
  ]
}

function formatStatusLabel(status) {
  if (status === 'verified') return '已认证'
  if (status === 'needs_review') return '需确认'

  return '待认证'
}

function formatSubmittedAtText(value) {
  if (!value) return '未记录'

  return String(value).replace('T', ' ').slice(0, 16)
}

function formatInstructorVerificationStudent(student) {
  return {
    ...student,
    classText: student.className || student.classId || '',
    collegeText: student.collegeName || student.collegeId || '',
    majorText: student.majorName || student.majorId || '',
    schoolText: student.schoolName || student.schoolId || '',
    statusLabel: formatStatusLabel(student.verificationStatus),
    submittedAtText: formatSubmittedAtText(student.submittedAt),
  }
}

module.exports = {
  buildInstructorVerificationQuery,
  createClassFilterOptions,
  formatInstructorVerificationStudent,
  statusFilters,
}
