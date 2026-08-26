type PayloadLike = {
  find(input: Record<string, unknown>): Promise<{ docs: Record<string, unknown>[] }>
}

function textItems(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (item && typeof item === 'object' && 'text' in item) {
        return String((item as { text: unknown }).text).trim()
      }

      return ''
    })
    .filter(Boolean)
}

function priceText(amountCents: number, durationDays: number) {
  const amount = Number.isInteger(amountCents / 100)
    ? String(amountCents / 100)
    : (amountCents / 100).toFixed(2)
  const duration = durationDays >= 180 && durationDays <= 186 ? '半年' : `${durationDays} 天`

  return `¥${amount} / ${duration}`
}

export function toGrowthPlanForMiniProgram(doc: Record<string, unknown>) {
  const durationDays = Number(doc.durationDays || 0)
  const priceCents = Number(doc.priceCents || 0)

  return {
    benefits: textItems(doc.benefits),
    description: typeof doc.description === 'string' ? doc.description : '',
    durationDays,
    id: String(doc.id),
    isActive: Boolean(doc.isActive),
    priceCents,
    priceText: priceText(priceCents, durationDays),
    title: String(doc.title || ''),
  }
}

export async function findActiveGrowthPlanForMiniProgram({ payload }: { payload: PayloadLike }) {
  const result = await payload.find({
    collection: 'growth-plans',
    depth: 0,
    limit: 1,
    where: { isActive: { equals: true } },
  })
  const doc = result.docs[0]

  return doc ? toGrowthPlanForMiniProgram(doc) : null
}
