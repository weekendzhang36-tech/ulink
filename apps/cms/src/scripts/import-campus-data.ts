import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload } from 'payload'

import {
  importCampusRows,
  parseCampusImportRows,
  type CampusPayload,
} from '../lib/campusImport.ts'

async function main(argv: string[]) {
  const filePath = argv[0]
  if (!filePath) {
    throw new Error('请提供校园数据 CSV/TSV 文件路径，例如：pnpm import:campus docs/templates/campus-import-template.csv')
  }

  const resolvedPath = path.resolve(process.cwd(), filePath)
  const fileContent = await readFile(resolvedPath, 'utf8')
  const rows = parseCampusImportRows(fileContent)
  const { default: config } = await import('../../payload.config.ts')
  const payload = await getPayload({ config })
  const result = await importCampusRows({
    payload: payload as unknown as CampusPayload,
    rows,
  })

  console.log(
    [
      `已读取 ${rows.length} 行校园数据`,
      `新增学校 ${result.schoolsCreated} 个`,
      `新增学院 ${result.collegesCreated} 个`,
      `新增专业 ${result.majorsCreated} 个`,
      `新增班级 ${result.classesCreated} 个`,
      `更新班级 ${result.classesUpdated} 个`,
    ].join('\n'),
  )

  await payload.destroy()
}

main(process.argv.slice(2))
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
