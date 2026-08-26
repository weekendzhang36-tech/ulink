const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const appRoot = path.resolve(__dirname, '..')
const runtimeDirs = ['pages', 'utils']
const visibleFileExtensions = new Set(['.js', '.wxml', '.wxs'])

function collectRuntimeFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name)
    if (entry.isDirectory()) return collectRuntimeFiles(filePath)
    if (!visibleFileExtensions.has(path.extname(entry.name))) return []
    if (entry.name.endsWith('.test.js')) return []

    return [filePath]
  })
}

test('student-facing Mini Program runtime copy does not expose internal backend wording', () => {
  const files = runtimeDirs.flatMap((dir) => collectRuntimeFiles(path.join(appRoot, dir)))
  const offenders = files
    .map((filePath) => ({
      filePath,
      text: fs.readFileSync(filePath, 'utf8'),
    }))
    .filter(({ text }) => text.includes('后台'))
    .map(({ filePath }) => path.relative(appRoot, filePath))

  assert.deepEqual(offenders, [])
})
