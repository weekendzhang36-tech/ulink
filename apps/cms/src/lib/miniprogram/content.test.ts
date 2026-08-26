import assert from 'node:assert/strict'
import test from 'node:test'

import { getPublishedContentDetail, listPublishedContents } from './content.ts'

const docs = [
  {
    _status: 'published',
    category: {
      isActive: true,
      module: 'practice',
      title: '实习实践',
    },
    contentType: 'event',
    id: 'content_practice_001',
    isFeatured: true,
    publishedAt: '2026-08-22T08:00:00.000Z',
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
  }
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
