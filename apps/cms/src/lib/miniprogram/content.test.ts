import assert from 'node:assert/strict'
import test from 'node:test'

import {
  cancelContentReservation,
  getPublishedContentDetail,
  listContentReservationsForStudent,
  listPublishedContents,
  registerForPublishedContent,
  toContentSummary,
} from './content.ts'
import { createSessionToken } from './session.ts'
import { createMemoryRepository } from './testing/memoryRepository.ts'

const secret = 'test-secret'

const docs = [
  {
    _status: 'published',
    category: {
      isActive: true,
      module: 'practice',
      title: '实习实践',
    },
    actionLabel: '预约报名',
    actionUrl: 'https://example.com/practice-camp',
    capacity: 50,
    contentType: 'event',
    id: 'content_practice_001',
    isFeatured: true,
    isMemberOnly: true,
    publishedAt: '2026-08-22T08:00:00.000Z',
    reservedCount: 36,
    status: 'open',
    summary: '2 小时体验客户资料整理和风险提示任务。',
    tags: [{ label: '实训营' }, { label: '真实任务' }],
    title: '金融岗位模拟实训营开放报名',
  },
  {
    _status: 'published',
    category: {
      isActive: false,
      module: 'practice',
      title: '实习实践',
    },
    contentType: 'opportunity',
    id: 'content_practice_inactive',
    isFeatured: true,
    publishedAt: '2026-08-23T08:00:00.000Z',
    summary: '这个分类已经关闭，不应继续展示。',
    title: '已关闭分类内容',
  },
]

function payloadFor(contentDocs: Record<string, unknown>[]) {
  return {
    find: async () => ({ docs: contentDocs }),
    findByID: async ({ id }: Record<string, unknown>) => {
      const doc = contentDocs.find((item) => item.id === id)
      if (!doc) throw new Error('not found')

      return doc
    },
    update: async ({ data, id }: Record<string, unknown>) => {
      const index = contentDocs.findIndex((item) => item.id === id)
      if (index < 0) throw new Error('not found')
      contentDocs[index] = { ...contentDocs[index], ...(data as Record<string, unknown>) }

      return contentDocs[index]
    },
  }
}

function tokenFor(studentId: string) {
  return createSessionToken({
    expiresInSeconds: 60 * 60,
    now: new Date('2026-08-26T10:00:00.000Z'),
    openId: 'openid_001',
    secret,
    studentId,
  })
}

async function approveStudent(repository: ReturnType<typeof createMemoryRepository>, studentId = 'student_001') {
  await repository.updateStudentVerificationStatus(studentId, 'verified')
}

test('lists only published contents from active categories for the requested module', async () => {
  const contents = await listPublishedContents({
    module: 'practice',
    payload: payloadFor(docs),
  })

  assert.deepEqual(
    contents.map((item) => item.id),
    ['content_practice_001'],
  )
  assert.deepEqual(contents[0].tags, ['实训营', '真实任务'])
  assert.equal(contents[0].categoryTitle, '实习实践')
  assert.equal(contents[0].actionLabel, '预约报名')
  assert.equal(contents[0].actionUrl, 'https://example.com/practice-camp')
  assert.equal(contents[0].capacityText, '36 人已预约 · 剩余 14 个名额')
  assert.equal(contents[0].isMemberOnly, true)
  assert.equal(contents[0].statusText, '报名中')
})

test('returns student-readable Chinese content type labels in content summaries', () => {
  const summary = toContentSummary({
    _status: 'published',
    category: {
      isActive: true,
      module: 'practice',
      title: '实习实践',
    },
    contentType: 'event',
    id: 'content_practice_label_001',
    publishedAt: '2026-08-22T08:00:00.000Z',
    summary: '2 小时体验客户资料整理和风险提示任务。',
    title: '金融岗位模拟实训营开放报名',
  })

  assert.equal(summary.contentType, 'event')
  assert.equal(summary.contentTypeText, '活动')
  assert.equal(summary.meta, '08-22 · 活动')
})

test('returns readable text for Payload richText content detail', async () => {
  const detail = await getPublishedContentDetail({
    id: 'content_detail_001',
    payload: payloadFor([
      {
        _status: 'published',
        body: {
          root: {
            children: [
              {
                children: [{ text: '第一段：介绍活动背景。' }],
              },
              {
                children: [{ text: '第二段：说明适合人群。' }],
              },
            ],
          },
        },
        category: {
          isActive: true,
          module: 'finance_foundation',
          title: '金融底色',
        },
        contentType: 'article',
        id: 'content_detail_001',
        publishedAt: '2026-08-22T08:00:00.000Z',
        summary: '摘要',
        title: '青年金融沙龙',
      },
    ]),
  })

  assert.equal(detail?.body, '第一段：介绍活动背景。\n\n第二段：说明适合人群。')
})

test('returns sanitized mini program rich text html for Payload richText content detail', async () => {
  const detail = await getPublishedContentDetail({
    id: 'content_rich_detail_001',
    payload: payloadFor([
      {
        _status: 'published',
        body: {
          root: {
            children: [
              {
                children: [{ text: '沙龙流程' }],
                tag: 'h2',
                type: 'heading',
              },
              {
                children: [
                  { format: 1, text: '报名后' },
                  { text: '会收到活动提醒，请查看' },
                  {
                    children: [{ text: '详情页' }],
                    fields: { url: 'https://example.com/detail?from=<cms>' },
                    type: 'link',
                  },
                  { text: '<script>alert(1)</script>' },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  { children: [{ text: '银行网点岗位分享' }], type: 'listitem' },
                  { children: [{ text: '客户沟通模拟' }], type: 'listitem' },
                ],
                listType: 'bullet',
                type: 'list',
              },
              {
                children: [{ text: '适合想先听真实经历的同学。' }],
                type: 'quote',
              },
              {
                relationTo: 'media',
                type: 'upload',
                value: {
                  alt: '金融沙龙现场',
                  url: 'https://cos.example.com/salon.jpg',
                },
              },
              {
                type: 'horizontalrule',
              },
            ],
          },
        },
        category: {
          isActive: true,
          module: 'finance_foundation',
          title: '金融底色',
        },
        contentType: 'article',
        id: 'content_rich_detail_001',
        publishedAt: '2026-08-22T08:00:00.000Z',
        summary: '摘要',
        title: '青年金融沙龙',
      },
    ]),
  })

  assert.match(detail?.bodyHtml || '', /<h2>沙龙流程<\/h2>/)
  assert.match(detail?.bodyHtml || '', /<strong>报名后<\/strong>/)
  assert.match(
    detail?.bodyHtml || '',
    /<a href="https:\/\/example\.com\/detail\?from=&lt;cms&gt;">详情页<\/a>/,
  )
  assert.match(detail?.bodyHtml || '', /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.match(detail?.bodyHtml || '', /<ul><li>银行网点岗位分享<\/li><li>客户沟通模拟<\/li><\/ul>/)
  assert.match(detail?.bodyHtml || '', /<blockquote>适合想先听真实经历的同学。<\/blockquote>/)
  assert.match(
    detail?.bodyHtml || '',
    /<img src="https:\/\/cos\.example\.com\/salon\.jpg" alt="金融沙龙现场" \/>/,
  )
  assert.match(detail?.bodyHtml || '', /<hr \/>/)
})

test('returns configured cover image urls for content list and detail', async () => {
  const payload = payloadFor([
    {
      _status: 'published',
      category: {
        isActive: true,
        module: 'finance_foundation',
        title: '金融底色',
      },
      contentType: 'event',
      coverImage: {
        url: 'https://cos.example.com/ulink/content/finance-salon.jpg',
      },
      id: 'content_with_cover_001',
      publishedAt: '2026-08-22T08:00:00.000Z',
      summary: '线下金融沙龙报名中。',
      title: '青年金融沙龙',
    },
  ])

  const list = await listPublishedContents({
    module: 'finance_foundation',
    payload,
  })
  const detail = await getPublishedContentDetail({
    id: 'content_with_cover_001',
    payload,
  })

  assert.equal(list[0].coverImageUrl, 'https://cos.example.com/ulink/content/finance-salon.jpg')
  assert.equal(detail?.coverImageUrl, 'https://cos.example.com/ulink/content/finance-salon.jpg')
})

test('locks member-only content details for viewers without active membership', async () => {
  const detail = await getPublishedContentDetail({
    id: 'content_member_only_001',
    payload: payloadFor([
      {
        _status: 'published',
        actionLabel: '预约报名',
        actionUrl: 'https://example.com/member-only-apply',
        body: {
          root: {
            children: [
              {
                children: [{ text: '会员可见的完整活动安排与报名说明。' }],
              },
            ],
          },
        },
        category: {
          isActive: true,
          module: 'practice',
          title: '实习实践',
        },
        contentType: 'event',
        id: 'content_member_only_001',
        isMemberOnly: true,
        publishedAt: '2026-08-22T08:00:00.000Z',
        summary: '列表可见的活动摘要。',
        title: '会员专属实训营',
      },
    ]),
    viewer: { hasActiveMembership: false },
  })

  assert.equal(detail?.isLocked, true)
  assert.equal(detail?.actionLabel, '开通成长计划')
  assert.equal(detail?.actionUrl, undefined)
  assert.match(detail?.body || '', /开通友邻成长计划/)
})

test('returns current viewer reservation state on content detail', async () => {
  const detail = await getPublishedContentDetail({
    id: 'content_reserved_001',
    payload: payloadFor([
      {
        _status: 'published',
        category: {
          isActive: true,
          module: 'practice',
          title: '实习实践',
        },
        contentType: 'event',
        id: 'content_reserved_001',
        publishedAt: '2026-08-22T08:00:00.000Z',
        reservedCount: 1,
        status: 'open',
        summary: '列表可见的活动摘要。',
        title: '会员专属实训营',
      },
    ]),
    viewer: {
      hasActiveMembership: true,
      reservation: {
        contentId: 'content_reserved_001',
        id: 'content_reservation_001',
        reservedAt: '2026-08-26T10:11:00.000Z',
        status: 'reserved',
        studentId: 'student_001',
      },
    },
  })

  assert.deepEqual(detail && 'reservation' in detail ? detail.reservation : undefined, {
    id: 'content_reservation_001',
    reservedAt: '2026-08-26T10:11:00.000Z',
    status: 'reserved',
    statusText: '已预约',
  })
})

test('marks content action as verification required for an unverified signed-in viewer', async () => {
  const detail = await getPublishedContentDetail({
    id: 'content_verification_required_001',
    payload: payloadFor([
      {
        _status: 'published',
        actionLabel: '预约报名',
        actionUrl: 'https://example.com/apply',
        category: {
          isActive: true,
          module: 'practice',
          title: '实习实践',
        },
        contentType: 'event',
        id: 'content_verification_required_001',
        publishedAt: '2026-08-22T08:00:00.000Z',
        status: 'open',
        summary: '面向已认证学生的线下实训活动。',
        title: '金融岗位模拟实训营',
      },
    ]),
    viewer: { hasActiveMembership: true, isVerifiedStudent: false },
  })

  assert.equal(detail?.requiresVerification, true)
  assert.equal(detail?.actionLabel, '查看认证进度')
  assert.equal(detail?.actionUrl, undefined)
  assert.match(detail?.verificationMessage || '', /学生认证通过后再预约/)
})

test('requires verified student before reserving open content', async () => {
  const repository = createMemoryRepository()

  await assert.rejects(
    () =>
      registerForPublishedContent({
        id: 'content_practice_open_001',
        input: { sessionToken: tokenFor('student_001') },
        now: new Date('2026-08-26T10:10:00.000Z'),
        payload: payloadFor([
          {
            _status: 'published',
            capacity: 2,
            category: {
              isActive: true,
              module: 'practice',
              title: '实习实践',
            },
            contentType: 'event',
            id: 'content_practice_open_001',
            isMemberOnly: false,
            publishedAt: '2026-08-22T08:00:00.000Z',
            reservedCount: 0,
            status: 'open',
            summary: '公开活动，但真实预约需要学生认证通过。',
            title: '公开实训体验',
          },
        ]),
        repository,
        secret,
      }),
    /学生认证通过后再预约/,
  )

  assert.equal(repository.contentReservations.size, 0)
})

test('requires active membership before reserving member-only content', async () => {
  const repository = createMemoryRepository()
  await approveStudent(repository)

  await assert.rejects(
    () =>
      registerForPublishedContent({
        id: 'content_member_only_001',
        input: { sessionToken: tokenFor('student_001') },
        now: new Date('2026-08-26T10:10:00.000Z'),
        payload: payloadFor([
          {
            _status: 'published',
            capacity: 2,
            category: {
              isActive: true,
              module: 'practice',
              title: '实习实践',
            },
            contentType: 'event',
            id: 'content_member_only_001',
            isMemberOnly: true,
            publishedAt: '2026-08-22T08:00:00.000Z',
            reservedCount: 0,
            status: 'open',
            summary: '会员专属实训营。',
            title: '会员专属实训营',
          },
        ]),
        repository,
        secret,
      }),
    /开通友邻成长计划/,
  )
})

test('creates one reservation per student and updates reserved count', async () => {
  const repository = createMemoryRepository()
  await approveStudent(repository)
  await repository.createMembership({
    expiresAt: '2027-02-25T10:03:00.000Z',
    growthPlanId: 'growth_plan_001',
    sourceOrderNo: 'order_paid_once',
    startedAt: '2026-08-26T10:03:00.000Z',
    status: 'active',
    studentId: 'student_001',
  })
  const payload = payloadFor([
    {
      _status: 'published',
      capacity: 2,
      category: {
        isActive: true,
        module: 'practice',
        title: '实习实践',
      },
      contentType: 'event',
      id: 'content_practice_001',
      isMemberOnly: true,
      publishedAt: '2026-08-22T08:00:00.000Z',
      reservedCount: 1,
      status: 'open',
      summary: '2 小时体验客户资料整理和风险提示任务。',
      title: '金融岗位模拟实训营开放报名',
    },
  ])

  const first = await registerForPublishedContent({
    id: 'content_practice_001',
    input: { sessionToken: tokenFor('student_001') },
    now: new Date('2026-08-26T10:11:00.000Z'),
    payload,
    repository,
    secret,
  })
  const second = await registerForPublishedContent({
    id: 'content_practice_001',
    input: { sessionToken: tokenFor('student_001') },
    now: new Date('2026-08-26T10:12:00.000Z'),
    payload,
    repository,
    secret,
  })

  assert.equal(first.alreadyReserved, false)
  assert.equal(first.content.capacityText, '2 人已预约 · 剩余 0 个名额')
  assert.equal(first.reservation.statusText, '已预约')
  assert.equal(second.alreadyReserved, true)
  assert.equal(repository.contentReservations.size, 1)
})

test('does not keep a reservation when reserved count update fails', async () => {
  const repository = createMemoryRepository()
  await approveStudent(repository)
  await repository.createMembership({
    expiresAt: '2027-02-25T10:03:00.000Z',
    growthPlanId: 'growth_plan_001',
    sourceOrderNo: 'order_paid_once',
    startedAt: '2026-08-26T10:03:00.000Z',
    status: 'active',
    studentId: 'student_001',
  })
  const payload = {
    ...payloadFor([
      {
        _status: 'published',
        capacity: 2,
        category: {
          isActive: true,
          module: 'practice',
          title: '实习实践',
        },
        contentType: 'event',
        id: 'content_practice_001',
        isMemberOnly: true,
        publishedAt: '2026-08-22T08:00:00.000Z',
        reservedCount: 1,
        status: 'open',
        summary: '2 小时体验客户资料整理和风险提示任务。',
        title: '金融岗位模拟实训营开放报名',
      },
    ]),
    update: async () => {
      throw new Error('reserved count write failed')
    },
  }

  await assert.rejects(
    () =>
      registerForPublishedContent({
        id: 'content_practice_001',
        input: { sessionToken: tokenFor('student_001') },
        now: new Date('2026-08-26T10:11:00.000Z'),
        payload,
        repository,
        secret,
      }),
    /reserved count write failed/,
  )

  assert.equal(repository.contentReservations.size, 0)
})

test('lists only current student reserved content reservations with content summaries', async () => {
  const repository = createMemoryRepository()
  await repository.createContentReservation({
    contentId: 'content_practice_001',
    reservedAt: '2026-08-26T10:11:00.000Z',
    status: 'reserved',
    studentId: 'student_001',
  })
  await repository.createContentReservation({
    contentId: 'content_other_student',
    reservedAt: '2026-08-26T10:12:00.000Z',
    status: 'reserved',
    studentId: 'student_other_class',
  })
  await repository.createContentReservation({
    contentId: 'content_cancelled',
    reservedAt: '2026-08-26T10:13:00.000Z',
    status: 'cancelled',
    studentId: 'student_001',
  })

  const result = await listContentReservationsForStudent({
    input: { sessionToken: tokenFor('student_001') },
    now: new Date('2026-08-26T10:20:00.000Z'),
    payload: payloadFor([
      {
        _status: 'published',
        category: {
          isActive: true,
          module: 'practice',
          title: '实习实践',
        },
        contentType: 'event',
        id: 'content_practice_001',
        publishedAt: '2026-08-22T08:00:00.000Z',
        reservedCount: 1,
        status: 'open',
        summary: '2 小时体验客户资料整理和风险提示任务。',
        tags: [{ label: '实训营' }],
        title: '金融岗位模拟实训营开放报名',
      },
      {
        _status: 'published',
        category: {
          isActive: true,
          module: 'practice',
          title: '实习实践',
        },
        contentType: 'event',
        id: 'content_other_student',
        publishedAt: '2026-08-23T08:00:00.000Z',
        status: 'open',
        summary: '其他同学预约的内容。',
        title: '其他同学预约',
      },
    ]),
    repository,
    secret,
  })

  assert.deepEqual(
    result.reservations.map((reservation) => reservation.id),
    ['content_reservation_001'],
  )
  assert.equal(result.reservations[0].statusText, '已预约')
  assert.equal(result.reservations[0].content.id, 'content_practice_001')
  assert.equal(result.reservations[0].content.title, '金融岗位模拟实训营开放报名')
  assert.deepEqual(result.reservations[0].content.tags, ['实训营'])
})

test('cancels the current student reservation and releases one reserved seat', async () => {
  const repository = createMemoryRepository()
  await repository.createContentReservation({
    contentId: 'content_practice_001',
    reservedAt: '2026-08-26T10:11:00.000Z',
    status: 'reserved',
    studentId: 'student_001',
  })
  const payload = payloadFor([
    {
      _status: 'published',
      capacity: 2,
      category: {
        isActive: true,
        module: 'practice',
        title: '实习实践',
      },
      contentType: 'event',
      id: 'content_practice_001',
      publishedAt: '2026-08-22T08:00:00.000Z',
      reservedCount: 2,
      status: 'open',
      summary: '2 小时体验客户资料整理和风险提示任务。',
      title: '金融岗位模拟实训营开放报名',
    },
  ])

  const result = await cancelContentReservation({
    input: {
      reservationId: 'content_reservation_001',
      sessionToken: tokenFor('student_001'),
    },
    now: new Date('2026-08-26T10:20:00.000Z'),
    payload,
    repository,
    secret,
  })

  assert.deepEqual(result.reservation, {
    id: 'content_reservation_001',
    reservedAt: '2026-08-26T10:11:00.000Z',
    status: 'cancelled',
    statusText: '已取消',
  })
  assert.equal(repository.contentReservations.get('content_reservation_001')?.status, 'cancelled')
  assert.equal((await payload.findByID({ id: 'content_practice_001' })).reservedCount, 1)
})

test('does not cancel another student content reservation', async () => {
  const repository = createMemoryRepository()
  await repository.createContentReservation({
    contentId: 'content_practice_001',
    reservedAt: '2026-08-26T10:11:00.000Z',
    status: 'reserved',
    studentId: 'student_other_class',
  })
  const payload = payloadFor([
    {
      _status: 'published',
      capacity: 2,
      category: {
        isActive: true,
        module: 'practice',
        title: '实习实践',
      },
      contentType: 'event',
      id: 'content_practice_001',
      publishedAt: '2026-08-22T08:00:00.000Z',
      reservedCount: 1,
      status: 'open',
      summary: '2 小时体验客户资料整理和风险提示任务。',
      title: '金融岗位模拟实训营开放报名',
    },
  ])

  await assert.rejects(
    () =>
      cancelContentReservation({
        input: {
          reservationId: 'content_reservation_001',
          sessionToken: tokenFor('student_001'),
        },
        now: new Date('2026-08-26T10:20:00.000Z'),
        payload,
        repository,
        secret,
      }),
    /预约不存在/,
  )

  assert.equal(repository.contentReservations.get('content_reservation_001')?.status, 'reserved')
  assert.equal((await payload.findByID({ id: 'content_practice_001' })).reservedCount, 1)
})

test('keeps an already cancelled reservation cancelled without releasing another seat', async () => {
  const repository = createMemoryRepository()
  await repository.createContentReservation({
    contentId: 'content_practice_001',
    reservedAt: '2026-08-26T10:11:00.000Z',
    status: 'reserved',
    studentId: 'student_001',
  })
  repository.contentReservations.set('content_reservation_001', {
    ...repository.contentReservations.get('content_reservation_001')!,
    status: 'cancelled',
  })
  const payload = payloadFor([
    {
      _status: 'published',
      capacity: 2,
      category: {
        isActive: true,
        module: 'practice',
        title: '实习实践',
      },
      contentType: 'event',
      id: 'content_practice_001',
      publishedAt: '2026-08-22T08:00:00.000Z',
      reservedCount: 1,
      status: 'open',
      summary: '2 小时体验客户资料整理和风险提示任务。',
      title: '金融岗位模拟实训营开放报名',
    },
  ])

  const result = await cancelContentReservation({
    input: {
      reservationId: 'content_reservation_001',
      sessionToken: tokenFor('student_001'),
    },
    now: new Date('2026-08-26T10:20:00.000Z'),
    payload,
    repository,
    secret,
  })

  assert.equal(result.reservation.status, 'cancelled')
  assert.equal((await payload.findByID({ id: 'content_practice_001' })).reservedCount, 1)
})
