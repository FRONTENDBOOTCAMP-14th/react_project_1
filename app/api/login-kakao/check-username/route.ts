import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username') || ''
  if (!username) return NextResponse.json({ ok: false, error: 'missing_username' }, { status: 400 })
  // 정책상 username은 중복 허용 → 참고용 count만 제공
  const count = await prisma.user.count({ where: { username, deletedAt: null } })
  return NextResponse.json({ ok: true, username, count })
}
