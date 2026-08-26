import { MiniProgramError } from './errors.ts'

export function ensureLocalMockAllowed(env: NodeJS.ProcessEnv, label: string) {
  if (env.NODE_ENV === 'production') {
    throw new MiniProgramError(`${label}不能在生产环境启用`, 500)
  }
}
