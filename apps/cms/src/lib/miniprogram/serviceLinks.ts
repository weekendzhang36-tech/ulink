type PayloadLike = {
  find(input: Record<string, unknown>): Promise<{ docs: Record<string, unknown>[] }>
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function serviceTypeLabel(serviceType: string) {
  if (serviceType === 'assessment') return '职业测评'
  if (serviceType === 'resume') return '简历服务'
  if (serviceType === 'consulting') return '规划咨询'
  if (serviceType === 'offline_space') return '线下空间'

  return '服务入口'
}

function normalizeEntryType(doc: Record<string, unknown>) {
  const entryType = String(doc.entryType || '')
  if (entryType === 'mini_program' || entryType === 'consultation') return entryType

  return 'external_link'
}

function actionLabel(serviceType: string) {
  if (serviceType === 'assessment') return '开始测评'
  if (serviceType === 'resume') return '查看简历服务'
  if (serviceType === 'consulting') return '预约咨询'
  if (serviceType === 'offline_space') return '查看空间'

  return '查看详情'
}

export function toServiceLinkSummary(doc: Record<string, unknown>) {
  const serviceType = String(doc.serviceType || '')
  const entryType = normalizeEntryType(doc)

  return {
    actionLabel: actionLabel(serviceType),
    contactHint: optionalString(doc.contactHint),
    description: String(doc.description || ''),
    entryType,
    id: String(doc.id),
    miniProgramAppId: optionalString(doc.miniProgramAppId),
    miniProgramPath: optionalString(doc.miniProgramPath),
    module: optionalString(doc.module),
    serviceType,
    title: String(doc.title || ''),
    typeLabel: serviceTypeLabel(serviceType),
    url: optionalString(doc.url),
  }
}

export async function listActiveServiceLinks({
  module,
  payload,
}: {
  module?: string
  payload: PayloadLike
}) {
  const result = await payload.find({
    collection: 'service-links',
    depth: 0,
    limit: 20,
    sort: 'serviceType',
    where: { isActive: { equals: true } },
  })

  return result.docs
    .filter((doc) => Boolean(doc.isActive))
    .map(toServiceLinkSummary)
    .filter((link) => !module || link.module === module)
}
