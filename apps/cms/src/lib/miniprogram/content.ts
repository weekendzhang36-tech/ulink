import { MiniProgramError } from './errors.ts'
import { verifySessionToken } from './session.ts'
import type {
  ContentReservationRecord,
  MembershipRecord,
  MiniProgramRepository,
} from './types.ts'

type PayloadLike = {
  find(input: Record<string, unknown>): Promise<{ docs: unknown[] }>
  findByID(input: Record<string, unknown>): Promise<unknown>
}

type ReservationPayloadLike = PayloadLike & {
  update(input: Record<string, unknown>): Promise<unknown>
}

type ContentViewer = {
  hasActiveMembership?: boolean
  isVerifiedStudent?: boolean
  reservation?: ContentReservationRecord
}

const memberOnlyLockMessage = '这是会员专属内容，开通友邻成长计划后可查看完整内容和报名入口。'
const verificationRequiredMessage = '学生认证通过后再预约成长服务。'

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

function mediaUrl(media: unknown) {
  if (typeof media === 'string') return undefined
  if (!media || typeof media !== 'object') return undefined

  const directUrl = 'url' in media ? optionalString((media as { url: unknown }).url) : undefined
  if (directUrl) return directUrl

  const sizes = 'sizes' in media ? (media as { sizes: unknown }).sizes : undefined
  if (!sizes || typeof sizes !== 'object') return undefined
  const preferredSize =
    'card' in sizes
      ? (sizes as { card: unknown }).card
      : 'large' in sizes
        ? (sizes as { large: unknown }).large
        : undefined

  return preferredSize && typeof preferredSize === 'object' && 'url' in preferredSize
    ? optionalString((preferredSize as { url: unknown }).url)
    : undefined
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

function openStatusOf(doc: Record<string, unknown>) {
  return doc.openStatus || doc.status || 'open'
}

function contentTypeText(contentType: string) {
  if (contentType === 'event') return '活动'
  if (contentType === 'opportunity') return '机会'
  if (contentType === 'service_link') return '服务入口'

  return '文章'
}

function capacityText(doc: Record<string, unknown>) {
  const capacity = positiveNumber(doc.capacity)
  const reservedCount = Math.max(0, Number(doc.reservedCount || 0))
  if (!capacity) {
    return reservedCount > 0 ? `${reservedCount} 人已预约` : undefined
  }

  return `${reservedCount} 人已预约 · 剩余 ${Math.max(0, capacity - reservedCount)} 个名额`
}

function hasUsableMembership(membership: MembershipRecord | undefined, now: Date) {
  if (!membership || membership.status !== 'active') return false

  return Date.parse(membership.expiresAt) > now.getTime()
}

function isReservableContentType(contentType: unknown) {
  return contentType === 'event' || contentType === 'opportunity'
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeUrl(value: unknown) {
  const url = optionalString(value)
  if (!url) return undefined

  return /^https?:\/\//i.test(url) ? escapeHtml(url) : undefined
}

function textNodeHtml(node: Record<string, unknown>) {
  let html = escapeHtml(node.text)
  const format = Number(node.format || 0)

  if (format & 16) html = `<code>${html}</code>`
  if (format & 8) html = `<u>${html}</u>`
  if (format & 4) html = `<s>${html}</s>`
  if (format & 2) html = `<em>${html}</em>`
  if (format & 1) html = `<strong>${html}</strong>`

  return html
}

function linkUrl(node: Record<string, unknown>) {
  if ('url' in node) return safeUrl(node.url)

  const fields = 'fields' in node ? node.fields : undefined
  return fields && typeof fields === 'object' && 'url' in fields
    ? safeUrl((fields as { url: unknown }).url)
    : undefined
}

function childrenHtml(children: unknown): string {
  if (!Array.isArray(children)) return ''

  return children.map((child) => lexicalNodeHtml(child)).join('')
}

function listItemsHtml(children: unknown) {
  if (!Array.isArray(children)) return ''

  return children
    .map((item) => {
      if (!item || typeof item !== 'object') return ''
      const html = childrenHtml((item as { children?: unknown }).children)

      return html ? `<li>${html}</li>` : ''
    })
    .join('')
}

function uploadImageHtml(node: Record<string, unknown>) {
  const value = 'value' in node ? node.value : undefined
  const src = safeUrl(mediaUrl(value) || ('url' in node ? node.url : undefined))
  if (!src) return ''

  const alt =
    value && typeof value === 'object' && 'alt' in value
      ? escapeHtml((value as { alt: unknown }).alt)
      : ''

  return `<img src="${src}" alt="${alt}" />`
}

function lexicalNodeHtml(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const record = node as Record<string, unknown>
  if (typeof record.text === 'string') return textNodeHtml(record)

  if (record.type === 'linebreak') return '<br />'

  if (record.type === 'link') {
    const html = childrenHtml(record.children)
    const href = linkUrl(record)

    return href && html ? `<a href="${href}">${html}</a>` : html
  }

  if (record.type === 'heading') {
    const tag = ['h1', 'h2', 'h3'].includes(String(record.tag)) ? String(record.tag) : 'h2'
    const html = childrenHtml(record.children)

    return html ? `<${tag}>${html}</${tag}>` : ''
  }

  if (record.type === 'list') {
    const tag = record.listType === 'number' ? 'ol' : 'ul'
    const html = listItemsHtml(record.children)

    return html ? `<${tag}>${html}</${tag}>` : ''
  }

  if (record.type === 'quote') {
    const html = childrenHtml(record.children)

    return html ? `<blockquote>${html}</blockquote>` : ''
  }

  if (record.type === 'upload') return uploadImageHtml(record)
  if (record.type === 'horizontalrule') return '<hr />'

  const html = childrenHtml(record.children)
  if (record.type === 'paragraph') return html ? `<p>${html}</p>` : ''

  return html
}

function formatReservation(reservation: ContentReservationRecord) {
  return {
    id: reservation.id,
    reservedAt: reservation.reservedAt,
    status: reservation.status,
    statusText: reservation.status === 'reserved' ? '已预约' : '已取消',
  }
}

async function findStudentFromSession({
  now,
  repository,
  secret,
  sessionToken,
}: {
  now: Date
  repository: MiniProgramRepository
  secret: string
  sessionToken: string
}) {
  const session = verifySessionToken({ now, secret, token: sessionToken })
  const student = session.studentId
    ? await repository.findStudentById(session.studentId)
    : await repository.findStudentByOpenId(session.openId)
  if (!student) {
    throw new MiniProgramError('请先完成学生资料')
  }

  return student
}

function richTextRootChildren(value: unknown): unknown[] | null {
  if (!value || typeof value !== 'object') return null

  const root = 'root' in value ? (value as { root: unknown }).root : value
  if (!root || typeof root !== 'object' || !('children' in root)) return null
  const children = (root as { children: unknown }).children

  return Array.isArray(children) ? children : null
}

function textFromLexicalNode(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const record = node as Record<string, unknown>
  if (typeof record.text === 'string') return record.text

  const children = record.children
  if (!Array.isArray(children)) return ''

  return children.map((child) => textFromLexicalNode(child)).join('')
}

function textFromRichText(value: unknown): string | null {
  if (typeof value === 'string') return value

  const children = richTextRootChildren(value)
  if (!children) return null

  const paragraphs = children
    .map((block) => textFromLexicalNode(block).trim())
    .filter(Boolean)

  return paragraphs.length > 0 ? paragraphs.join('\n\n') : null
}

function htmlFromRichText(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const paragraphs = value
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)

    return paragraphs.length ? paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('') : undefined
  }

  const children = richTextRootChildren(value)
  if (!children) return undefined

  const html = children.map((child) => lexicalNodeHtml(child)).join('')

  return html || undefined
}

export function toContentSummary(doc: Record<string, unknown>) {
  const contentType = String(doc.contentType || 'article')
  const readableContentType = contentTypeText(contentType)

  return {
    actionLabel: optionalString(doc.actionLabel),
    actionUrl: optionalString(doc.actionUrl),
    capacityText: capacityText(doc),
    categoryTitle: relationTitle(doc.category),
    contentType,
    contentTypeText: readableContentType,
    coverImageUrl: mediaUrl(doc.coverImage),
    id: String(doc.id),
    isMemberOnly: Boolean(doc.isMemberOnly),
    meta: [doc.publishedAt ? String(doc.publishedAt).slice(5, 10) : '', readableContentType]
      .filter(Boolean)
      .join(' · '),
    module: relationModule(doc.category),
    status: String(openStatusOf(doc)),
    statusText: statusText(openStatusOf(doc)),
    summary: String(doc.summary || ''),
    tags: tagsOf(doc.tags),
    title: String(doc.coverTitle || doc.title || ''),
  }
}

export function toContentDetail(doc: Record<string, unknown>, reservation?: ContentReservationRecord) {
  const body = textFromRichText(doc.body) || String(doc.summary || '')

  return {
    ...toContentSummary(doc),
    body,
    bodyHtml: htmlFromRichText(doc.body) || htmlFromRichText(body),
    isLocked: false,
    publishedAt: doc.publishedAt,
    reservation: reservation ? formatReservation(reservation) : undefined,
    requiresVerification: false,
    verificationMessage: undefined,
  }
}

function lockMemberOnlyDetail(detail: ReturnType<typeof toContentDetail>) {
  return {
    ...detail,
    actionLabel: '开通成长计划',
    actionUrl: undefined,
    body: memberOnlyLockMessage,
    bodyHtml: htmlFromRichText(memberOnlyLockMessage),
    isLocked: true,
    lockMessage: memberOnlyLockMessage,
  }
}

function hasContentAction(detail: ReturnType<typeof toContentDetail>) {
  return Boolean(detail.actionLabel || detail.actionUrl)
}

function requireVerificationForDetail(detail: ReturnType<typeof toContentDetail>) {
  return {
    ...detail,
    actionLabel: '查看认证进度',
    actionUrl: undefined,
    requiresVerification: true,
    verificationMessage: verificationRequiredMessage,
  }
}

function ensureVerifiedStudent(student: Awaited<ReturnType<typeof findStudentFromSession>>) {
  if (student.verificationStatus !== 'verified') {
    throw new MiniProgramError(verificationRequiredMessage, 403)
  }

  return student
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
  const docs = result.docs.filter(
    (doc): doc is Record<string, unknown> => Boolean(doc && typeof doc === 'object'),
  )
  const summaries = docs.filter((doc) => relationIsActive(doc.category)).map(toContentSummary)

  return module ? summaries.filter((content) => content.module === module) : summaries
}

export async function getPublishedContentDetail({
  id,
  payload,
  viewer,
}: {
  id: string
  payload: PayloadLike
  viewer?: ContentViewer
}) {
  let doc: Record<string, unknown>
  try {
    const result = await payload.findByID({ collection: 'contents', depth: 1, id })
    if (!result || typeof result !== 'object') return undefined
    doc = result as Record<string, unknown>
  } catch {
    return undefined
  }
  if (doc._status !== 'published' || !relationIsActive(doc.category)) {
    return undefined
  }

  const detail = toContentDetail(doc, viewer?.reservation)
  if (detail.isMemberOnly && !viewer?.hasActiveMembership) {
    return lockMemberOnlyDetail(detail)
  }
  if (viewer && viewer.isVerifiedStudent === false && hasContentAction(detail)) {
    return requireVerificationForDetail(detail)
  }

  return detail
}

export async function registerForPublishedContent({
  id,
  input,
  now,
  payload,
  repository,
  secret,
}: {
  id: string
  input: {
    sessionToken: string
  }
  now: Date
  payload: ReservationPayloadLike
  repository: MiniProgramRepository
  secret: string
}) {
  const student = ensureVerifiedStudent(await findStudentFromSession({
    now,
    repository,
    secret,
    sessionToken: input.sessionToken,
  }))
  let doc: Record<string, unknown>
  try {
    const result = await payload.findByID({ collection: 'contents', depth: 1, id })
    if (!result || typeof result !== 'object') {
      throw new MiniProgramError('内容不存在或暂未发布', 404)
    }
    doc = result as Record<string, unknown>
  } catch {
    throw new MiniProgramError('内容不存在或暂未发布', 404)
  }
  if (doc._status !== 'published' || !relationIsActive(doc.category)) {
    throw new MiniProgramError('内容不存在或暂未发布', 404)
  }
  if (!isReservableContentType(doc.contentType)) {
    throw new MiniProgramError('当前内容暂不支持预约')
  }
  if (openStatusOf(doc) !== 'open') {
    throw new MiniProgramError('当前内容暂未开放预约')
  }

  const existingReservation = await repository.findContentReservationByStudentAndContent({
    contentId: String(doc.id),
    studentId: student.id,
  })
  if (existingReservation) {
    return {
      alreadyReserved: true,
      content: toContentDetail(doc, existingReservation),
      reservation: formatReservation(existingReservation),
    }
  }

  if (Boolean(doc.isMemberOnly)) {
    const membership = await repository.findMembershipByStudentId(student.id)
    if (!hasUsableMembership(membership, now)) {
      throw new MiniProgramError('开通友邻成长计划后可预约会员专属内容', 403)
    }
  }

  const currentReservedCount = Math.max(0, Number(doc.reservedCount || 0))
  const capacity = positiveNumber(doc.capacity)
  if (capacity && currentReservedCount >= capacity) {
    throw new MiniProgramError('名额已满')
  }

  const reservation = await repository.createContentReservation({
    contentId: String(doc.id),
    reservedAt: now.toISOString(),
    status: 'reserved',
    studentId: student.id,
  })
  let updatedDoc: Record<string, unknown>
  try {
    const result = await payload.update({
      collection: 'contents',
      data: { reservedCount: currentReservedCount + 1 },
      id: String(doc.id),
    })
    if (!result || typeof result !== 'object') {
      throw new MiniProgramError('预约结果暂时不可用', 500)
    }
    updatedDoc = result as Record<string, unknown>
  } catch (error) {
    await repository.deleteContentReservation(reservation.id)
    throw error
  }

  return {
    alreadyReserved: false,
    content: toContentDetail(updatedDoc, reservation),
    reservation: formatReservation(reservation),
  }
}

export async function listContentReservationsForStudent({
  input,
  now,
  payload,
  repository,
  secret,
}: {
  input: {
    sessionToken: string
  }
  now: Date
  payload: PayloadLike
  repository: MiniProgramRepository
  secret: string
}) {
  const student = await findStudentFromSession({
    now,
    repository,
    secret,
    sessionToken: input.sessionToken,
  })
  const reservations = await repository.findContentReservationsByStudentId(student.id)
  const summaries = await Promise.all(
    reservations.map(async (reservation) => {
      try {
        const result = await payload.findByID({
          collection: 'contents',
          depth: 1,
          id: reservation.contentId,
        })
        if (!result || typeof result !== 'object') {
          return undefined
        }
        const doc = result as Record<string, unknown>
        if (doc._status !== 'published' || !relationIsActive(doc.category)) {
          return undefined
        }

        return {
          ...formatReservation(reservation),
          content: toContentSummary(doc),
        }
      } catch {
        return undefined
      }
    }),
  )

  return {
    reservations: summaries.filter((item): item is NonNullable<typeof item> => Boolean(item)),
  }
}

export async function cancelContentReservation({
  input,
  now,
  payload,
  repository,
  secret,
}: {
  input: {
    reservationId: string
    sessionToken: string
  }
  now: Date
  payload: ReservationPayloadLike
  repository: MiniProgramRepository
  secret: string
}) {
  const student = await findStudentFromSession({
    now,
    repository,
    secret,
    sessionToken: input.sessionToken,
  })
  const reservation = await repository.findContentReservationById(input.reservationId)
  if (!reservation || reservation.studentId !== student.id) {
    throw new MiniProgramError('预约不存在', 404)
  }
  if (reservation.status === 'cancelled') {
    return {
      reservation: formatReservation(reservation),
    }
  }

  let doc: Record<string, unknown>
  try {
    const result = await payload.findByID({ collection: 'contents', depth: 0, id: reservation.contentId })
    if (!result || typeof result !== 'object') {
      throw new MiniProgramError('预约内容不存在', 404)
    }
    doc = result as Record<string, unknown>
  } catch {
    throw new MiniProgramError('预约内容不存在', 404)
  }

  const cancelledReservation = await repository.updateContentReservation(reservation.id, {
    status: 'cancelled',
  })
  try {
    await payload.update({
      collection: 'contents',
      data: { reservedCount: Math.max(0, Number(doc.reservedCount || 0) - 1) },
      id: reservation.contentId,
    })
  } catch (error) {
    await repository.updateContentReservation(reservation.id, { status: 'reserved' })
    throw error
  }

  return {
    reservation: formatReservation(cancelledReservation),
  }
}
