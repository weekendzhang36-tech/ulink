import { getMiniProgramPayload, handleMiniProgramRoute, ok } from '@/lib/miniprogram/routeHelpers.ts'

function relationId(value: unknown) {
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: unknown }).id)
  }

  return value === undefined || value === null ? undefined : String(value)
}

function option(doc: { id: number | string; name?: unknown; title?: unknown }) {
  return {
    id: String(doc.id),
    name: String(doc.name || doc.title || ''),
  }
}

function collegeOption(doc: { id: number | string; name?: unknown; school?: unknown }) {
  return {
    ...option(doc),
    schoolId: relationId(doc.school),
  }
}

function majorOption(doc: { college?: unknown; id: number | string; name?: unknown }) {
  return {
    ...option(doc),
    collegeId: relationId(doc.college),
  }
}

function classOption(doc: { id: number | string; major?: unknown; name?: unknown }) {
  return {
    ...option(doc),
    majorId: relationId(doc.major),
  }
}

export async function GET() {
  return handleMiniProgramRoute(async () => {
    const payload = await getMiniProgramPayload()
    const [schools, colleges, majors, classes] = await Promise.all([
      payload.find({ collection: 'schools', limit: 100, where: { isActive: { equals: true } } }),
      payload.find({ collection: 'colleges', depth: 0, limit: 200, where: { isActive: { equals: true } } }),
      payload.find({ collection: 'majors', depth: 0, limit: 500, where: { isActive: { equals: true } } }),
      payload.find({ collection: 'classes', depth: 0, limit: 500, where: { isActive: { equals: true } } }),
    ])

    return ok({
      classes: classes.docs.map(classOption),
      colleges: colleges.docs.map(collegeOption),
      majors: majors.docs.map(majorOption),
      schools: schools.docs.map(option),
    })
  })
}
