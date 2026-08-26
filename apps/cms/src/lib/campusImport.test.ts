import assert from 'node:assert/strict'
import test from 'node:test'

import { importCampusRows, parseCampusImportRows } from './campusImport.ts'

test('parses campus import rows and normalizes instructor phones', () => {
  const rows = parseCampusImportRows(`学校,城市,学院,专业,班级,入学年份,指导员手机号
广东金融学院,广州,金融与投资学院,金融学,金融学 2026-1 班,2026,"13900000001、13900000002; 13900000001"
广东金融学院,广州,金融与投资学院,金融学,金融学 2026-2 班,2026,13900000003`)

  assert.deepEqual(rows, [
    {
      city: '广州',
      className: '金融学 2026-1 班',
      collegeName: '金融与投资学院',
      entryYear: 2026,
      instructorPhones: ['13900000001', '13900000002'],
      majorName: '金融学',
      schoolName: '广东金融学院',
    },
    {
      city: '广州',
      className: '金融学 2026-2 班',
      collegeName: '金融与投资学院',
      entryYear: 2026,
      instructorPhones: ['13900000003'],
      majorName: '金融学',
      schoolName: '广东金融学院',
    },
  ])
})

test('rejects campus import rows with missing required hierarchy fields', () => {
  assert.throws(
    () =>
      parseCampusImportRows(`学校,城市,学院,专业,班级,入学年份,指导员手机号
广东金融学院,广州,金融与投资学院,,金融学 2026-1 班,2026,13900000001`),
    /第 2 行缺少专业/,
  )
})

test('rejects campus import rows with invalid instructor phones', () => {
  assert.throws(
    () =>
      parseCampusImportRows(`schoolName,city,collegeName,majorName,className,entryYear,instructorPhones
广东金融学院,广州,金融与投资学院,金融学,金融学 2026-1 班,2026,12345`),
    /第 2 行指导员手机号格式不正确/,
  )
})

test('rejects conflicting duplicate classes in the same import file', () => {
  assert.throws(
    () =>
      parseCampusImportRows(`schoolName,city,collegeName,majorName,className,entryYear,instructorPhones
广东金融学院,广州,金融与投资学院,金融学,金融学 2026-1 班,2026,13900000001
广东金融学院,广州,金融与投资学院,金融学,金融学 2026-1 班,2027,13900000001`),
    /第 3 行班级与前文重复但入学年份不同/,
  )
})

test('upserts schools colleges majors classes and instructor phones', async () => {
  const payload = createFakeCampusPayload()

  const result = await importCampusRows({
    payload,
    rows: [
      {
        city: '广州',
        className: '金融学 2026-1 班',
        collegeName: '金融与投资学院',
        entryYear: 2026,
        instructorPhones: ['13900000001', '13900000002'],
        majorName: '金融学',
        schoolName: '广东金融学院',
      },
      {
        city: '广州',
        className: '金融学 2026-2 班',
        collegeName: '金融与投资学院',
        entryYear: 2026,
        instructorPhones: ['13900000003'],
        majorName: '金融学',
        schoolName: '广东金融学院',
      },
    ],
  })

  assert.deepEqual(result, {
    classesCreated: 2,
    classesUpdated: 0,
    collegesCreated: 1,
    majorsCreated: 1,
    schoolsCreated: 1,
  })
  assert.equal(payload.docs.schools.length, 1)
  assert.equal(payload.docs.colleges.length, 1)
  assert.equal(payload.docs.majors.length, 1)
  assert.deepEqual(
    payload.docs.classes.map((item) => ({
      entryYear: item.entryYear,
      instructorPhones: item.instructorPhones,
      major: item.major,
      name: item.name,
    })),
    [
      {
        entryYear: 2026,
        instructorPhones: [{ phone: '13900000001' }, { phone: '13900000002' }],
        major: 'majors_001',
        name: '金融学 2026-1 班',
      },
      {
        entryYear: 2026,
        instructorPhones: [{ phone: '13900000003' }],
        major: 'majors_001',
        name: '金融学 2026-2 班',
      },
    ],
  )
})

test('updates existing classes during campus import without duplicating hierarchy records', async () => {
  const payload = createFakeCampusPayload({
    schools: [{ city: '广州', id: 'schools_existing', isActive: true, name: '广东金融学院' }],
    colleges: [
      {
        id: 'colleges_existing',
        isActive: true,
        name: '金融与投资学院',
        school: 'schools_existing',
      },
    ],
    majors: [
      {
        college: 'colleges_existing',
        id: 'majors_existing',
        isActive: true,
        name: '金融学',
      },
    ],
    classes: [
      {
        entryYear: 2026,
        id: 'classes_existing',
        instructorPhones: [{ phone: '13900000001' }],
        isActive: true,
        major: 'majors_existing',
        name: '金融学 2026-1 班',
      },
    ],
  })

  const result = await importCampusRows({
    payload,
    rows: [
      {
        city: '广州',
        className: '金融学 2026-1 班',
        collegeName: '金融与投资学院',
        entryYear: 2026,
        instructorPhones: ['13900000001', '13900000002'],
        majorName: '金融学',
        schoolName: '广东金融学院',
      },
    ],
  })

  assert.deepEqual(result, {
    classesCreated: 0,
    classesUpdated: 1,
    collegesCreated: 0,
    majorsCreated: 0,
    schoolsCreated: 0,
  })
  assert.equal(payload.docs.schools.length, 1)
  assert.equal(payload.docs.colleges.length, 1)
  assert.equal(payload.docs.majors.length, 1)
  assert.equal(payload.docs.classes.length, 1)
  assert.deepEqual(payload.docs.classes[0], {
    entryYear: 2026,
    id: 'classes_existing',
    instructorPhones: [{ phone: '13900000001' }, { phone: '13900000002' }],
    isActive: true,
    major: 'majors_existing',
    name: '金融学 2026-1 班',
  })
})

type CollectionName = 'classes' | 'colleges' | 'majors' | 'schools'
type FakeDoc = Record<string, unknown> & { id: string; name: string }

function createFakeCampusPayload(seed: Partial<Record<CollectionName, FakeDoc[]>> = {}) {
  const docs: Record<CollectionName, FakeDoc[]> = {
    classes: [...(seed.classes || [])],
    colleges: [...(seed.colleges || [])],
    majors: [...(seed.majors || [])],
    schools: [...(seed.schools || [])],
  }

  function nextId(collection: CollectionName) {
    return `${collection}_${String(docs[collection].length + 1).padStart(3, '0')}`
  }

  return {
    docs,
    async create(input: { collection: CollectionName; data: Record<string, unknown> }) {
      const doc = { ...input.data, id: nextId(input.collection) } as FakeDoc
      docs[input.collection].push(doc)

      return doc
    },
    async find(input: { collection: CollectionName; where: Record<string, unknown> }) {
      return {
        docs: docs[input.collection].filter((doc) => matchesWhere(doc, input.where)),
      }
    },
    async update(input: {
      collection: CollectionName
      data: Record<string, unknown>
      id: string
    }) {
      const index = docs[input.collection].findIndex((doc) => doc.id === input.id)
      assert.notEqual(index, -1)
      docs[input.collection][index] = { ...docs[input.collection][index], ...input.data }

      return docs[input.collection][index]
    },
  }
}

function matchesWhere(doc: FakeDoc, where: Record<string, unknown>): boolean {
  if ('and' in where && Array.isArray(where.and)) {
    return where.and.every((condition) => matchesWhere(doc, condition as Record<string, unknown>))
  }

  return Object.entries(where).every(([field, condition]) => {
    if (!condition || typeof condition !== 'object' || !('equals' in condition)) {
      return false
    }

    return doc[field] === (condition as { equals: unknown }).equals
  })
}
