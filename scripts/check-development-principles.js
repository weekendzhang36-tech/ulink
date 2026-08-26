const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

const requiredPrincipleSections = [
  'Truthfulness And Data Integrity',
  'Product Modeling',
  'State And URLs',
  'Persistence And Side Effects',
  'Testing Integrity',
  'Debugging Method',
  'Frontend And UX',
  'API And Data Contracts',
  'Deployment And Persistence',
  'Worktree And Branch Discipline',
  'Verification Before Completion',
]

const requiredReferences = [
  {
    file: 'README.md',
    snippets: ['DEVELOPMENT_PRINCIPLES.md', 'docs/development-workflow.md', 'docs/development-checklist.md'],
  },
  {
    file: 'CONTRIBUTING.md',
    snippets: ['DEVELOPMENT_PRINCIPLES.md', 'docs/development-checklist.md'],
  },
  {
    file: 'AGENTS.md',
    snippets: ['DEVELOPMENT_PRINCIPLES.md', 'CONTRIBUTING.md', 'docs/development-workflow.md', 'docs/development-checklist.md'],
  },
  {
    file: 'docs/development-workflow.md',
    snippets: ['DEVELOPMENT_PRINCIPLES.md', '生产路径不能用前端 fallback', '持久化要求', '完成定义'],
  },
  {
    file: 'docs/development-checklist.md',
    snippets: ['DEVELOPMENT_PRINCIPLES.md', '原则门禁', '持久化与密钥', '完成标准'],
  },
]

function readProjectFile(file) {
  return fs.readFileSync(path.join(root, file), 'utf8')
}

function reportFailure(message) {
  console.error(`principles check failed: ${message}`)
  process.exitCode = 1
}

const principles = readProjectFile('DEVELOPMENT_PRINCIPLES.md')

for (const section of requiredPrincipleSections) {
  if (!principles.includes(`## ${section}`)) {
    reportFailure(`DEVELOPMENT_PRINCIPLES.md is missing section "${section}"`)
  }
}

for (const reference of requiredReferences) {
  const content = readProjectFile(reference.file)

  for (const snippet of reference.snippets) {
    if (!content.includes(snippet)) {
      reportFailure(`${reference.file} is missing required reference "${snippet}"`)
    }
  }
}

if (!process.exitCode) {
  console.log('development principles are wired into project docs')
}
