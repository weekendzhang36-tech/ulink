type PayloadLike = {
  find(input: Record<string, unknown>): Promise<{ docs: Record<string, unknown>[] }>
}

const careerPlanningServiceTypes = new Set(['assessment', 'resume', 'consulting'])

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

function actionLabel(serviceType: string) {
  if (serviceType === 'assessment') return '开始测评'
  if (serviceType === 'resume') return '查看简历服务'
  if (serviceType === 'consulting') return '预约咨询'
  if (serviceType === 'offline_space') return '查看空间'

  return '查看详情'
}

function isServiceLinkVisibleInModule(serviceType: string, module?: string) {
  if (!module) return true
  if (module === 'career_planning') return careerPlanningServiceTypes.has(serviceType)

  return false
}

export function toServiceLinkSummary(doc: Record<string, unknown>) {
  const serviceType = String(doc.serviceType || '')

  return {
    actionLabel: actionLabel(serviceType),
    description: String(doc.description || ''),
    id: String(doc.id),
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
    .filter((link) => isServiceLinkVisibleInModule(link.serviceType, module))
}
