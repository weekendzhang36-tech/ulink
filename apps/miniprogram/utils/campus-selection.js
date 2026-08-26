const emptyCampus = {
  classes: [],
  colleges: [],
  majors: [],
  schools: [],
}

const fallbackLabels = {
  class: '请选择班级',
  college: '请选择学院',
  major: '请选择专业',
  school: '请选择学校',
}

const dependentKeys = {
  school: ['college', 'major', 'class'],
  college: ['major', 'class'],
  major: ['class'],
  class: [],
}

function normalizeIndex(value) {
  const number = Number(value)

  return Number.isInteger(number) && number >= 0 ? number : 0
}

function clampIndex(list, value) {
  if (!Array.isArray(list) || list.length === 0) return 0

  return Math.min(normalizeIndex(value), list.length - 1)
}

function normalizeIndexes(indexes = {}) {
  return {
    class: normalizeIndex(indexes.class),
    college: normalizeIndex(indexes.college),
    major: normalizeIndex(indexes.major),
    school: normalizeIndex(indexes.school),
  }
}

function normalizeCampus(campus = {}) {
  return {
    classes: Array.isArray(campus.classes) ? campus.classes : [],
    colleges: Array.isArray(campus.colleges) ? campus.colleges : [],
    majors: Array.isArray(campus.majors) ? campus.majors : [],
    schools: Array.isArray(campus.schools) ? campus.schools : [],
  }
}

function selectedLabel(list, index, fallback) {
  const item = list[index]

  return item ? item.name : fallback
}

function filterByParent(list, parent, parentKey) {
  if (!parent) return []
  if (!list.some((item) => item && item[parentKey])) return list

  return list.filter((item) => item && item[parentKey] === parent.id)
}

function buildCampusSelection(rawCampus, rawIndexes = {}) {
  const source = normalizeCampus(rawCampus)
  const indexes = normalizeIndexes(rawIndexes)
  const schools = source.schools
  indexes.school = clampIndex(schools, indexes.school)
  const school = schools[indexes.school]

  const colleges = filterByParent(source.colleges, school, 'schoolId')
  indexes.college = clampIndex(colleges, indexes.college)
  const college = colleges[indexes.college]

  const majors = filterByParent(source.majors, college, 'collegeId')
  indexes.major = clampIndex(majors, indexes.major)
  const major = majors[indexes.major]

  const classes = filterByParent(source.classes, major, 'majorId')
  indexes.class = clampIndex(classes, indexes.class)

  const campus = {
    classes,
    colleges,
    majors,
    schools,
  }

  return {
    campus,
    indexes,
    selectedLabels: {
      class: selectedLabel(classes, indexes.class, fallbackLabels.class),
      college: selectedLabel(colleges, indexes.college, fallbackLabels.college),
      major: selectedLabel(majors, indexes.major, fallbackLabels.major),
      school: selectedLabel(schools, indexes.school, fallbackLabels.school),
    },
  }
}

function updateCampusSelection(rawCampus, currentIndexes, key, value) {
  const indexes = {
    ...normalizeIndexes(currentIndexes),
    [key]: normalizeIndex(value),
  }
  ;(dependentKeys[key] || []).forEach((dependentKey) => {
    indexes[dependentKey] = 0
  })

  return buildCampusSelection(rawCampus, indexes)
}

function indexById(list, id) {
  const index = list.findIndex((item) => item && item.id === id)

  return index >= 0 ? index : 0
}

function findCampusIndexesByIds(rawCampus, ids = {}) {
  const source = normalizeCampus(rawCampus)
  const school = source.schools.find((item) => item && item.id === ids.schoolId)
  const colleges = filterByParent(source.colleges, school, 'schoolId')
  const college = colleges.find((item) => item && item.id === ids.collegeId)
  const majors = filterByParent(source.majors, college, 'collegeId')
  const major = majors.find((item) => item && item.id === ids.majorId)
  const classes = filterByParent(source.classes, major, 'majorId')

  return {
    class: indexById(classes, ids.classId),
    college: indexById(colleges, ids.collegeId),
    major: indexById(majors, ids.majorId),
    school: indexById(source.schools, ids.schoolId),
  }
}

module.exports = {
  buildCampusSelection,
  emptyCampus,
  fallbackLabels,
  findCampusIndexesByIds,
  updateCampusSelection,
}
