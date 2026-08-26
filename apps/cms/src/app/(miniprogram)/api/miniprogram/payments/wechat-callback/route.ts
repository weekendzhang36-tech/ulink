import { MiniProgramError } from '@/lib/miniprogram/errors.ts'
import { handleWechatPayCallback } from '@/lib/miniprogram/wechatPayCallback.ts'
import { getMiniProgramRepository } from '@/lib/miniprogram/routeHelpers.ts'

function callbackHeaders(request: Request) {
  return {
    'wechatpay-nonce': request.headers.get('wechatpay-nonce') || undefined,
    'wechatpay-serial': request.headers.get('wechatpay-serial') || undefined,
    'wechatpay-signature': request.headers.get('wechatpay-signature') || undefined,
    'wechatpay-timestamp': request.headers.get('wechatpay-timestamp') || undefined,
  }
}

function wechatPayResponse(code: 'SUCCESS' | 'FAIL', message: string, status = 200) {
  return Response.json({ code, message }, { status })
}

export async function POST(request: Request) {
  try {
    await handleWechatPayCallback({
      env: process.env,
      headers: callbackHeaders(request),
      now: new Date(),
      rawBody: await request.text(),
      repository: await getMiniProgramRepository(),
    })

    return wechatPayResponse('SUCCESS', '成功')
  } catch (error) {
    if (error instanceof MiniProgramError) {
      return wechatPayResponse('FAIL', error.message, error.status >= 500 ? 500 : 200)
    }

    console.error(error)
    return wechatPayResponse('FAIL', '服务暂时不可用，请稍后重试', 500)
  }
}
