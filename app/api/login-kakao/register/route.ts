import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createUser, isEmailTaken, isNicknameTaken } from '@/lib/repositories/user'
import { getErrorMessage } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const provider = 'kakao'
    const providerId = String(body.providerId || '')
    const email = (body.email ?? '').trim()
    const username = (body.username as string) || (providerId ? `kakao_${providerId}` : '')
    const nickname = (body.nickname ?? null) as string | null

    if (!providerId) {
      return NextResponse.json({ success: false, error: 'missing_provider_id' }, { status: 400 })
    }
    if (!username) {
      return NextResponse.json({ success: false, error: 'missing_username' }, { status: 400 })
    }
    if (!email) {
      return NextResponse.json({ success: false, error: 'missing_email' }, { status: 400 })
    }

    // 이메일 중복 체크(활성 사용자 기준)
    if (email) {
      const taken = await isEmailTaken(email)
      if (taken) {
        return NextResponse.json({ success: false, error: 'email_taken' }, { status: 409 })
      }
    }

    // 닉네임 중복 체크(정책상 유니크)
    if (nickname) {
      const taken = await isNicknameTaken(nickname)
      if (taken) {
        return NextResponse.json({ success: false, error: 'nickname_taken' }, { status: 409 })
      }
    }

    const user = await createUser({ provider, providerId, email, username, nickname })

    // 클라이언트에서 NextAuth Credentials Provider로 즉시 로그인 처리
    return NextResponse.json({
      ok: true,
      success: true,
      userId: user.userId,
      user: { userId: user.userId, username: user.username, nickname: user.nickname },
    })
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: 'register_failed', detail: getErrorMessage(e, 'Unknown error') },
      { status: 500 }
    )
  }
}
