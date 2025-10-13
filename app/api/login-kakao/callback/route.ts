import { NextRequest, NextResponse } from 'next/server'
import { exchangeToken, getKakaoUserInfo } from '@/lib/oauth/kakao'
import { findByProviderId } from '@/lib/repositories/user'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.json({ ok: false, error, message: 'Authorization failed' }, { status: 400 })
  }
  if (!code) {
    return NextResponse.json({ ok: false, error: 'missing_code' }, { status: 400 })
  }

  const clientId = process.env.KAKAO_CLIENT_ID
  const redirectUri = process.env.KAKAO_REDIRECT_URI
  const clientSecret = process.env.KAKAO_CLIENT_SECRET
  if (!clientId || !redirectUri) {
    return NextResponse.json({ ok: false, error: 'server_misconfig' }, { status: 500 })
  }

  try {
    const token = await exchangeToken({ code, clientId, redirectUri, clientSecret })
    const me = await getKakaoUserInfo(token.access_token)
    const provider = 'kakao'
    const providerId = String(me.id)
    const email = me.kakao_account?.email ?? null

    const existing = await findByProviderId(provider, providerId)
    if (existing) {
      // TODO: 세션 발급/유지 구현(NextAuth 또는 커스텀 세션)
      // 현재는 임시로 리다이렉트만 수행
      const next = process.env.LOGIN_SUCCESS_REDIRECT || '/'
      return NextResponse.redirect(new URL(next, req.url))
    }

    // 미가입: 프런트에서 회원가입 페이지로 연결할 수 있도록 최소 정보 반환
    return NextResponse.json({
      ok: true,
      needsRegistration: true,
      data: {
        provider,
        providerId,
        email,
        // username은 정책상 kakao_<id> 제안(중복 허용)
        suggestedUsername: `kakao_${providerId}`,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'callback_failed', detail: e?.message }, { status: 500 })
  }
}
