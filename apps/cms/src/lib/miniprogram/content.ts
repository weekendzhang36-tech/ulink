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

function relationIsActive(category: unknown) {
  if (category && typeof category === 'object' && 'isActive' in category) {
    return Boolean((category as { isActive: unknown }).isActive)
  }

  return true
}

function tagsOf(tags: unknown) {
  return Array.isArray(tags)
    ? tags
        .map((tag) => (tag && typeof tag === 'object' && 'label' in tag ? String(tag.label) : ''))
        .filter(Boolean)
    : []
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function positiveNumber(value: unknown) {
  const number = Number(value || 0)

  return Number.isFinite(number) && number > 0 ? number : undefined
}

function statusText(status: unknown) {
  if (status === 'upcoming') return '即将开放'
  if (status === 'closed') return '已结束'

  return '报名中'
}

function capacityText(doc: Record<string, unknown>) {
  const capacity = positiveNumber(doc.capacity)
  const reservedCount = Math.max(0, Number(doc.reservedCount || 0))
  if (!capacity) {
    return reservedCount > 0 ? `${reservedCount} 人已预约` : undefined
  }

  return `${reservedCount} 人已预约 · 剩余 ${Math.max(0, capacity - reservedCount)} 个名额`
}

function textFromRichText(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return null

  const root = 'root' in value ? (value as { root: unknown }).root : value
  if (!root || typeof root !== 'object' || !('children' in root)) return null
  const children = (root as { children: unknown }).children
  if (!Array.isArray(children)) return null

  const paragraphs = children
    .map((block) => {
      if (!block || typeof block !== 'object' || !('children' in block)) return ''
      const blockChildren = (block as { children: unknown }).children
      if (!Array.isArray(blockChildren)) return ''

      return blockChildren
        .map((node) => (node && typeof node === 'object' && 'text' in node ? String(node.text) : ''))
        .join('')
        .trim()
    })
    .filter(Boolean)

  return paragraphs.length > 0 ? paragraphs.join('\n\n') : null
}

export function toContentSummary(doc: Record<string, unknown>) {
  return {
    actionLabel: optionalString(doc.actionLabel),
    actionUrl: optionalString(doc.actionUrl),
    capacityText: capacityText(doc),
    categoryTitle: relationTitle(doc.category),
    contentType: String(doc.contentType || 'article'),
    id: String(doc.id),
    isMemberOnly: Boolean(doc.isMemberOnly),
    meta: [doc.publishedAt ? String(doc.publishedAt).slice(5, 10) : '', String(doc.contentType || '')]
      .filter(Boolean)
      .join(' · '),
    module: relationModule(doc.category),
    status: String(doc.status || 'open'),
    statusText: statusText(doc.status),
    summary: String(doc.summary || ''),
    tags: tagsOf(doc.tags),
    title: String(doc.coverTitle || doc.title || ''),
  }
}

export function toContentDetail(doc: Record<string, unknown>) {
  return {
    ...toContentSummary(doc),
    body: textFromRichText(doc.body) || String(doc.summary || ''),
    publishedAt: doc.publishedAt,
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
  const summaries = result.docs.filter((doc) => relationIsActive(doc.category)).map(toContentSummary)

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
  if (doc._status !== 'published' || !relationIsActive(doc.category)) {
    return undefined
  }

  return toContentDetail(doc)
}
