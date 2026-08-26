export interface CampusImportRow {
  city?: string
  className: string
  collegeName: string
  entryYear?: number
  instructorPhones: string[]
  majorName: string
  schoolName: string
}

export interface CampusImportResult {
  classesCreated: number
  classesUpdated: number
  collegesCreated: number
  majorsCreated: number
  schoolsCreated: number
}

type CampusCollection = 'classes' | 'colleges' | 'majors' | 'schools'

export type CampusPayload = {
  create(input: { collection: CampusCollection; data: Record<string, unknown> }): Promise<Record<string, unknown>>
  find(input: {
    collection: CampusCollection
    depth?: number
    limit?: number
    where: Record<string, unknown>
  }): Promise<{ docs: Record<string, unknown>[] }>
  update(input: {
    collection: CampusCollection
    data: Record<string, unknown>
    id: string
  }): Promise<Record<string, unknown>>
}

const headerAliases: Record<string, keyof RawCampusImportRow> = {
  city: 'city',
  class: 'className',
  classname: 'className',
  className: 'className',
  college: 'collegeName',
  collegename: 'collegeName',
  collegeName: 'collegeName',
  entryyear: 'entryYear',
  entryYear: 'entryYear',
  instructorphone: 'instructorPhones',
  instructorphones: 'instructorPhones',
  instructorPhones: 'instructorPhones',
  major: 'majorName',
  majorname: 'majorName',
  majorName: 'majorName',
  school: 'schoolName',
  schoolname: 'schoolName',
  schoolName: 'schoolName',
  入学年份: 'entryYear',
  城市: 'city',
  学校: 'schoolName',
  学校名称: 'schoolName',
  学院: 'collegeName',
  学院名称: 'collegeName',
  专业: 'majorName',
  专业名称: 'majorName',
  班级: 'className',
  班级名称: 'className',
  指导员手机号: 'instructorPhones',
}

interface RawCampusImportRow {
  city?: string
  className?: string
  collegeName?: string
  entryYear?: string
  instructorPhones?: string
  majorName?: string
  schoolName?: string
}

function splitDelimitedLine(line: string, delimiter: string) {
  const values: string[] = []
  let current = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]
    if (character === '"') {
      if (quoted && nextCharacter === '"') {
        current += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === delimiter && !quoted) {
      values.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }
  values.push(current.trim())

  return values
}

function detectDelimiter(headerLine: string) {
  return headerLine.includes('\t') ? '\t' : ','
}

function normalizeHeader(value: string) {
  return value.trim().replace(/\s+/g, '')
}

function parseInstructorPhones(raw: string | undefined, lineNumber: number) {
  if (!raw) return []

  const phones = raw
    .split(/[,\u3001;；\s]+/)
    .map((phone) => phone.trim())
    .filter(Boolean)
  const uniquePhones = [...new Set(phones)]
  const invalidPhone = uniquePhones.find((phone) => !/^1\d{10}$/.test(phone))
  if (invalidPhone) {
    throw new Error(`第 ${lineNumber} 行指导员手机号格式不正确：${invalidPhone}`)
  }

  return uniquePhones
}

function parseEntryYear(raw: string | undefined, lineNumber: number) {
  if (!raw) return undefined

  const year = Number(raw)
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error(`第 ${lineNumber} 行入学年份格式不正确`)
  }

  return year
}

function requireField(value: string | undefined, label: string, lineNumber: number) {
  const normalized = value?.trim()
  if (!normalized) {
    throw new Error(`第 ${lineNumber} 行缺少${label}`)
  }

  return normalized
}

function normalizeRow(raw: RawCampusImportRow, lineNumber: number): CampusImportRow {
  return {
    city: raw.city?.trim() || undefined,
    className: requireField(raw.className, '班级', lineNumber),
    collegeName: requireField(raw.collegeName, '学院', lineNumber),
    entryYear: parseEntryYear(raw.entryYear, lineNumber),
    instructorPhones: parseInstructorPhones(raw.instructorPhones, lineNumber),
    majorName: requireField(raw.majorName, '专业', lineNumber),
    schoolName: requireField(raw.schoolName, '学校', lineNumber),
  }
}

function assertNoConflictingDuplicateClasses(rows: CampusImportRow[]) {
  const seen = new Map<string, CampusImportRow & { lineNumber: number }>()
  rows.forEach((row, index) => {
    const lineNumber = index + 2
    const key = [row.schoolName, row.collegeName, row.majorName, row.className].join('\n')
    const previous = seen.get(key)
    if (!previous) {
      seen.set(key, { ...row, lineNumber })

      return
    }
    if (previous.entryYear !== row.entryYear) {
      throw new Error(`第 ${lineNumber} 行班级与前文重复但入学年份不同`)
    }
  })
}

export function parseCampusImportRows(input: string): CampusImportRow[] {
  const lines = input
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim())
  if (lines.length < 2) {
    throw new Error('导入文件至少需要表头和一行数据')
  }

  const delimiter = detectDelimiter(lines[0])
  const headers = splitDelimitedLine(lines[0], delimiter).map((header) => {
    const normalized = normalizeHeader(header)
    const fieldName = headerAliases[normalized]
    if (!fieldName) {
      throw new Error(`导入文件包含不支持的表头：${header}`)
    }

    return fieldName
  })
  const rows = lines.slice(1).map((line, index) => {
    const lineNumber = index + 2
    const values = splitDelimitedLine(line, delimiter)
    const raw = headers.reduce<RawCampusImportRow>((acc, fieldName, valueIndex) => {
      acc[fieldName] = values[valueIndex] || ''

      return acc
    }, {})

    return normalizeRow(raw, lineNumber)
  })
  assertNoConflictingDuplicateClasses(rows)

  return rows
}

async function firstByName(
  payload: CampusPayload,
  collection: CampusCollection,
  where: Record<string, unknown>,
) {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    where,
  })

  return result.docs[0]
}

async function upsertSchool(
  payload: CampusPayload,
  row: CampusImportRow,
  result: CampusImportResult,
) {
  const existing = await firstByName(payload, 'schools', {
    name: { equals: row.schoolName },
  })
  if (existing) {
    return existing
  }

  result.schoolsCreated += 1

  return payload.create({
    collection: 'schools',
    data: {
      city: row.city,
      isActive: true,
      name: row.schoolName,
    },
  })
}

async function upsertCollege(
  payload: CampusPayload,
  row: CampusImportRow,
  schoolId: string,
  result: CampusImportResult,
) {
  const existing = await firstByName(payload, 'colleges', {
    and: [{ name: { equals: row.collegeName } }, { school: { equals: schoolId } }],
  })
  if (existing) {
    return existing
  }

  result.collegesCreated += 1

  return payload.create({
    collection: 'colleges',
    data: {
      isActive: true,
      name: row.collegeName,
      school: schoolId,
    },
  })
}

async function upsertMajor(
  payload: CampusPayload,
  row: CampusImportRow,
  collegeId: string,
  result: CampusImportResult,
) {
  const existing = await firstByName(payload, 'majors', {
    and: [{ name: { equals: row.majorName } }, { college: { equals: collegeId } }],
  })
  if (existing) {
    return existing
  }

  result.majorsCreated += 1

  return payload.create({
    collection: 'majors',
    data: {
      college: collegeId,
      isActive: true,
      name: row.majorName,
    },
  })
}

async function upsertClass(
  payload: CampusPayload,
  row: CampusImportRow,
  majorId: string,
  result: CampusImportResult,
) {
  const data = {
    entryYear: row.entryYear,
    instructorPhones: row.instructorPhones.map((phone) => ({ phone })),
    isActive: true,
    major: majorId,
    name: row.className,
  }
  const existing = await firstByName(payload, 'classes', {
    and: [{ name: { equals: row.className } }, { major: { equals: majorId } }],
  })
  if (existing) {
    result.classesUpdated += 1

    return payload.update({
      collection: 'classes',
      data,
      id: String(existing.id),
    })
  }

  result.classesCreated += 1

  return payload.create({
    collection: 'classes',
    data,
  })
}

export async function importCampusRows({
  payload,
  rows,
}: {
  payload: CampusPayload
  rows: CampusImportRow[]
}): Promise<CampusImportResult> {
  const result = {
    classesCreated: 0,
    classesUpdated: 0,
    collegesCreated: 0,
    majorsCreated: 0,
    schoolsCreated: 0,
  }

  for (const row of rows) {
    const school = await upsertSchool(payload, row, result)
    const college = await upsertCollege(payload, row, String(school.id), result)
    const major = await upsertMajor(payload, row, String(college.id), result)
    await upsertClass(payload, row, String(major.id), result)
  }

  return result
}
