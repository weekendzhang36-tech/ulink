import assert from 'node:assert/strict'
import test from 'node:test'

import { Contents } from '../collections/Content.ts'

test('contents collection avoids status field collision with Payload drafts', () => {
  const fieldNames = Contents.fields
    .filter((field) => 'name' in field)
    .map((field) => String(field.name))

  assert.equal(Boolean(Contents.versions && typeof Contents.versions === 'object' && Contents.versions.drafts), true)
  assert.equal(fieldNames.includes('status'), false)
  assert.equal(fieldNames.includes('openStatus'), true)
})

test('contents collection uses a rich text body for operator editing', () => {
  const bodyField = Contents.fields.find((field) => 'name' in field && field.name === 'body')

  assert.ok(bodyField)
  assert.equal(bodyField.type, 'richText')
  assert.match(String(bodyField.label), /富文本/)
  assert.match(String(bodyField.admin && 'description' in bodyField.admin ? bodyField.admin.description : ''), /不要粘贴自定义 HTML/)
})
