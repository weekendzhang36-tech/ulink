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
