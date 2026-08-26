const assert = require('node:assert/strict')
const test = require('node:test')

const { buildCampusSelection, updateCampusSelection } = require('./campus-selection')

const campus = {
  classes: [
    { id: 'class_finance_1', majorId: 'major_finance', name: '金融学 2026-1 班' },
    { id: 'class_accounting_1', majorId: 'major_accounting', name: '会计学 2026-1 班' },
  ],
  colleges: [
    { id: 'college_finance', name: '金融学院', schoolId: 'school_gduf' },
    { id: 'college_business', name: '商学院', schoolId: 'school_other' },
  ],
  majors: [
    { collegeId: 'college_finance', id: 'major_finance', name: '金融学' },
    { collegeId: 'college_business', id: 'major_accounting', name: '会计学' },
  ],
  schools: [
    { id: 'school_gduf', name: '广东金融学院' },
    { id: 'school_other', name: '其他学校' },
  ],
}

test('filters campus pickers by selected school college and major', () => {
  const selection = buildCampusSelection(campus, {
    class: 0,
    college: 0,
    major: 0,
    school: 0,
  })

  assert.deepEqual(
    selection.campus.colleges.map((item) => item.id),
    ['college_finance'],
  )
  assert.deepEqual(
    selection.campus.majors.map((item) => item.id),
    ['major_finance'],
  )
  assert.deepEqual(
    selection.campus.classes.map((item) => item.id),
    ['class_finance_1'],
  )
  assert.equal(selection.selectedLabels.college, '金融学院')
  assert.equal(selection.selectedLabels.major, '金融学')
  assert.equal(selection.selectedLabels.class, '金融学 2026-1 班')
})

test('resets dependent campus picker indexes when parent changes', () => {
  const selection = updateCampusSelection(
    campus,
    {
      class: 0,
      college: 0,
      major: 0,
      school: 0,
    },
    'school',
    1,
  )

  assert.deepEqual(selection.indexes, {
    class: 0,
    college: 0,
    major: 0,
    school: 1,
  })
  assert.deepEqual(
    selection.campus.colleges.map((item) => item.id),
    ['college_business'],
  )
  assert.deepEqual(
    selection.campus.majors.map((item) => item.id),
    ['major_accounting'],
  )
  assert.deepEqual(
    selection.campus.classes.map((item) => item.id),
    ['class_accounting_1'],
  )
})
