/**
 * Next.js Middleware - 글로벌 인증 및 라우트 가드
 *
 * 주요 기능:
 * - 모든 보호된 라우트에 대한 일관된 인증 처리
 * - 인증되지 않은 사용자의 접근을 서버 측에서 차단
 * - 불필요한 페이지 로드 방지 및 성능 향상
 * - NextAuth와 통합하여 JWT 토큰 기반 인증 확인
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/middleware
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

/**
 * 공개 API 엔드포인트 (인증 불필요)
 */
const PUBLIC_API_ROUTES = ['/api/auth', '/api/health', '/api/region', '/api/login-kakao']

/**
 * 인증이 필요한 API 엔드포인트 (POST, PATCH, DELETE 요청만)
 * - GET /api/communities는 공개 (조회만 가능)
 * - POST /api/communities는 보호 (생성)
 * - PATCH/DELETE /api/communities/*는 보호 (수정/삭제)
 */
const PROTECTED_API_ROUTES = [
  '/api/goals',
  '/api/rounds',
  '/api/members',
  '/api/attendance',
  '/api/notifications',
  '/api/profile',
  '/api/user',
]

/**
 * 인증이 필요한 페이지 경로
 */
const PROTECTED_PAGE_ROUTES = ['/goal', '/profile']

/**
 * 경로가 보호된 경로인지 확인
 */
function isProtectedRoute(pathname: string, method?: string): boolean {
  // 보호된 API 경로 확인
  if (PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))) {
    // GET 요청은 공개 (조회만 가능)
    if (method === 'GET') return false
    // POST, PATCH, DELETE는 보호
    return true
  }

  // 보호된 페이지 경로 확인
  if (PROTECTED_PAGE_ROUTES.some(route => pathname.startsWith(route))) {
    return true
  }

  return false
}

/**
 * 경로가 공개 경로인지 확인
 */
function isPublicRoute(pathname: string): boolean {
  // 공개 API 경로 확인
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return true
  }

  // 루트 및 로그인 페이지
  if (pathname === '/' || pathname === '/login') {
    return true
  }

  // 정적 파일 및 Next.js 내부 경로
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')) {
    return true
  }

  return false
}

/**
 * NextAuth 미들웨어 설정
 * withAuth를 사용하여 JWT 토큰 기반 인증 확인
 */
export default withAuth(
  req => {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    const method = req.method

    // 보호된 라우트인데 토큰이 없는 경우
    if (isProtectedRoute(pathname, method) && !token) {
      // API 요청인 경우 401 응답
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized', message: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      // 페이지 요청인 경우 로그인 페이지로 리다이렉트
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // 로그인된 사용자가 로그인 페이지 접근 시 홈으로 리다이렉트
    if (pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // 인증 성공 - 요청 계속 진행
    return NextResponse.next()
  },
  {
    callbacks: {
      /**
       * 미들웨어 실행 여부 결정
       * 공개 경로는 미들웨어를 실행하지 않음
       */
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl

        // 공개 경로는 항상 허용
        if (isPublicRoute(pathname)) {
          return true
        }

        // 보호된 경로는 토큰 존재 여부로 판단 (HTTP 메소드 고려)
        if (isProtectedRoute(pathname, req.method)) {
          return !!token
        }

        // 기타 경로는 허용
        return true
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

/**
 * 미들웨어가 실행될 경로 매칭 설정
 *
 * - matcher를 통해 미들웨어가 실행될 경로를 지정
 * - 정적 파일, 이미지, Next.js 내부 파일은 제외
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 미들웨어 적용:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico (파비콘)
     * - public 폴더의 파일 (svg, png, jpg, jpeg, gif, webp, ico 등)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
