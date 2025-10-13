import { NextRequest, NextResponse } from 'next/server'
import { createUser, isEmailTaken, isNicknameTaken } from '@/lib/repositories/user'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const provider = 'kakao'
    const providerId = String(body.providerId || '')
    const email = (body.email ?? null) as string | null
    const username = (body.username as string) || (providerId ? `kakao_${providerId}` : '')
    const nickname = (body.nickname ?? null) as string | null

    if (!providerId) {
      return NextResponse.json({ ok: false, error: 'missing_provider_id' }, { status: 400 })
    }
    if (!username) {
      return NextResponse.json({ ok: false, error: 'missing_username' }, { status: 400 })
    }

    // 이메일 중복 체크(활성 사용자 기준)
    if (email) {
      const taken = await isEmailTaken(email)
      if (taken) {
        return NextResponse.json({ ok: false, error: 'email_taken' }, { status: 409 })
      }
    }

    // 닉네임 중복 체크(정책상 유니크)
    if (nickname) {
      const taken = await isNicknameTaken(nickname)
      if (taken) {
        return NextResponse.json({ ok: false, error: 'nickname_taken' }, { status: 409 })
      }
    }

    const user = await createUser({ provider, providerId, email, username, nickname })

    // TODO: 세션 발급/로그인 상태 설정(NextAuth 또는 커스텀)
    return NextResponse.json({ ok: true, user: { userId: user.userId, username: user.username, nickname: user.nickname } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'register_failed', detail: e?.message }, { status: 500 })
  }
}
