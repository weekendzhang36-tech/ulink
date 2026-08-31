const assert = require('node:assert/strict')
const test = require('node:test')

const { formatContentArticle } = require('./content-rich-text')

test('keeps backend rich text html for content detail rendering', () => {
  const article = formatContentArticle({
    body: '纯文本正文',
    bodyHtml: '<h2>沙龙流程</h2><p>第一段</p>',
    id: 'content_001',
    summary: '摘要',
  })

  assert.equal(article.body, '纯文本正文')
  assert.equal(article.bodyHtml, '<h2>沙龙流程</h2><p>第一段</p>')
  assert.equal(article.hasRichBody, true)
})

test('falls back to escaped paragraphs when backend rich text html is absent', () => {
  const article = formatContentArticle({
    body: '第一段<script>\n\n第二段',
    id: 'content_001',
    summary: '摘要',
  })

  assert.equal(article.body, '第一段<script>\n\n第二段')
  assert.equal(article.bodyHtml, '<p>第一段&lt;script&gt;</p><p>第二段</p>')
  assert.equal(article.hasRichBody, true)
})

test('uses summary when body is missing', () => {
  const article = formatContentArticle({
    id: 'content_001',
    summary: '只有摘要',
  })

  assert.equal(article.body, '只有摘要')
  assert.equal(article.bodyHtml, '<p>只有摘要</p>')
})
