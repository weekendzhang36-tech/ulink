export class MiniProgramError extends Error {
  readonly status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'MiniProgramError'
    this.status = status
  }
}

export function requireValue(value: string | undefined, label: string) {
  if (!value || value.trim().length === 0) {
    throw new MiniProgramError(`${label}不能为空`)
  }

  return value.trim()
}
