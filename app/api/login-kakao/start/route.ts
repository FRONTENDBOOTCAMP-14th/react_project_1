import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Delegate to NextAuth sign-in flow for Kakao
export async function GET(req: NextRequest) {
  const callbackUrl = new URL('/', req.url).toString()
  const url = new URL('/api/auth/signin/kakao', req.url)
  url.searchParams.set('callbackUrl', process.env.LOGIN_SUCCESS_REDIRECT || callbackUrl)
  return NextResponse.redirect(url)
}
