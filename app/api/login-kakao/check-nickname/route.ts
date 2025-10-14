import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { isNicknameTaken } from '@/lib/repositories/user'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const nickname = searchParams.get('nickname') || ''
  if (!nickname) return NextResponse.json({ ok: false, error: 'missing_nickname' }, { status: 400 })
  const taken = await isNicknameTaken(nickname)
  return NextResponse.json({ ok: true, nickname, taken })
}
