import { getMiniProgramPayload, handleMiniProgramRoute, ok } from '@/lib/miniprogram/routeHelpers.ts'

function option(doc: { id: number | string; name?: unknown; title?: unknown }) {
  return {
    id: String(doc.id),
    name: String(doc.name || doc.title || ''),
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
      classes: classes.docs.map(option),
      colleges: colleges.docs.map(option),
      majors: majors.docs.map(option),
      schools: schools.docs.map(option),
    })
  })
}
