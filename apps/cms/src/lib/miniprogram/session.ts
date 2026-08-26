import { createHmac, timingSafeEqual } from 'node:crypto'

import { MiniProgramError } from './errors.ts'
import type { MiniProgramSession } from './types.ts'

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createSessionToken(input: {
  expiresInSeconds: number
  now: Date
  openId: string
  secret: string
  studentId?: string
  unionId?: string
}) {
  const payload: MiniProgramSession = {
    exp: Math.floor(input.now.getTime() / 1000) + input.expiresInSeconds,
    openId: input.openId,
    studentId: input.studentId,
    unionId: input.unionId,
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')

  return `${encoded}.${sign(encoded, input.secret)}`
}

export function verifySessionToken(input: { now: Date; secret: string; token: string }) {
  const [encoded, signature] = input.token.split('.')
  if (!encoded || !signature) {
    throw new MiniProgramError('Invalid session token', 401)
  }

  const expected = sign(encoded, input.secret)
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new MiniProgramError('Invalid session token', 401)
  }

  let session: MiniProgramSession
  try {
    session = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as MiniProgramSession
  } catch {
    throw new MiniProgramError('Invalid session token', 401)
  }
  if (!session.openId || !session.exp) {
    throw new MiniProgramError('Invalid session token', 401)
  }

  if (session.exp <= Math.floor(input.now.getTime() / 1000)) {
    throw new MiniProgramError('Session token expired', 401)
  }

  return session
}
