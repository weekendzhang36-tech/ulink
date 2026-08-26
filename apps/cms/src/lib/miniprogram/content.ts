type PayloadLike = {
  find(input: Record<string, unknown>): Promise<{ docs: Record<string, unknown>[] }>
  findByID(input: Record<string, unknown>): Promise<Record<string, unknown>>
}

function relationModule(category: unknown) {
  if (category && typeof category === 'object' && 'module' in category) {
    return String((category as { module: unknown }).module)
  }

  return undefined
}

function relationTitle(category: unknown) {
  if (category && typeof category === 'object' && 'title' in category) {
    return String((category as { title: unknown }).title)
  }

  return undefined
}

export function toContentSummary(doc: Record<string, unknown>) {
  return {
    categoryTitle: relationTitle(doc.category),
    contentType: String(doc.contentType || 'article'),
    id: String(doc.id),
    meta: [doc.publishedAt ? String(doc.publishedAt).slice(5, 10) : '', String(doc.contentType || '')]
      .filter(Boolean)
      .join(' · '),
    module: relationModule(doc.category),
    summary: String(doc.summary || ''),
    title: String(doc.coverTitle || doc.title || ''),
  }
}

export function toContentDetail(doc: Record<string, unknown>) {
  return {
    ...toContentSummary(doc),
    body: doc.body || null,
    publishedAt: doc.publishedAt,
    tags: Array.isArray(doc.tags)
      ? doc.tags.map((tag) =>
          tag && typeof tag === 'object' && 'label' in tag ? String(tag.label) : '',
        )
      : [],
  }
}

export async function listPublishedContents({
  featuredOnly = false,
  module,
  payload,
}: {
  featuredOnly?: boolean
  module?: string
  payload: PayloadLike
}) {
  const conditions: Record<string, unknown>[] = [{ _status: { equals: 'published' } }]
  if (featuredOnly) {
    conditions.push({ isFeatured: { equals: true } })
  }

  const result = await payload.find({
    collection: 'contents',
    depth: 1,
    limit: 20,
    sort: '-publishedAt',
    where: conditions.length === 1 ? conditions[0] : { and: conditions },
  })
  const summaries = result.docs.map(toContentSummary)

  return module ? summaries.filter((content) => content.module === module) : summaries
}

export async function getPublishedContentDetail({
  id,
  payload,
}: {
  id: string
  payload: PayloadLike
}) {
  let doc: Record<string, unknown>
  try {
    doc = await payload.findByID({ collection: 'contents', depth: 1, id })
  } catch {
    return undefined
  }
  if (doc._status !== 'published') {
    return undefined
  }

  return toContentDetail(doc)
}
