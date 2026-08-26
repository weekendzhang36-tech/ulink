import config from '@payload-config'
import { getPayload } from 'payload'

import { MiniProgramError } from './errors.ts'
import { createPayloadRepository } from './payloadRepository.ts'
import { verifySessionToken } from './session.ts'

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    throw new MiniProgramError('请求 JSON 格式不正确')
  }
}

export function ok(data: unknown, status = 200) {
  return Response.json({ data }, { status })
}

export function getServerSecret() {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new MiniProgramError('服务端会话密钥未配置', 500)
  }

  return secret
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization') || ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)

  return match?.[1]
}

export function getSessionFromRequest(request: Request, now = new Date()) {
  const token = getBearerToken(request)
  if (!token) {
    throw new MiniProgramError('请先登录', 401)
  }

  return verifySessionToken({ now, secret: getServerSecret(), token })
}

export async function getMiniProgramRepository() {
  const payload = await getMiniProgramPayload()

  return createPayloadRepository(payload)
}

export async function getMiniProgramPayload() {
  const payload = await getPayload({ config })

  return payload
}

export async function handleMiniProgramRoute(handler: () => Promise<Response>) {
  try {
    return await handler()
  } catch (error) {
    if (error instanceof MiniProgramError) {
      return Response.json({ error: { message: error.message } }, { status: error.status })
    }

    console.error(error)
    return Response.json({ error: { message: '服务暂时不可用，请稍后重试' } }, { status: 500 })
  }
}
