import { NextRequest, NextResponse } from 'next/server'
import { isEmailTaken } from '@/lib/repositories/user'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email') || ''
  if (!email) return NextResponse.json({ ok: false, error: 'missing_email' }, { status: 400 })
  const taken = await isEmailTaken(email)
  return NextResponse.json({ ok: true, email, taken })
}
