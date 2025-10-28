/**
 * API 인증 유틸리티
 * - Next.js 미들웨어와 함께 사용하는 간소화된 인증 헬퍼
 * - 미들웨어가 이미 인증을 처리하므로 API에서는 더 간단하게 사용 가능
 */

import { getCurrentUserId, getSession, getUserRole, hasPermission } from '@/lib/auth'
import type { CustomSession } from '@/lib/types'
import { createErrorResponse } from './response'
import type { NextResponse } from 'next/server'

/**
 * API 라우트에서 현재 사용자 ID 가져오기 (간편 버전)
 * 미들웨어가 이미 인증을 확인했으므로 에러 처리는 간소화
 *
 * @returns userId와 에러 응답
 *
 * @example
 * ```typescript
 * export async function GET() {
 *   const { userId, error } = await requireAuthUser()
 *   if (error) return error
 *
 *   // userId를 사용한 로직
 *   return NextResponse.json({ userId })
 * }
 * ```
 */
export async function requireAuthUser(): Promise<{
  userId: string | null
  error: NextResponse | null
}> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return {
      userId: null,
      error: createErrorResponse('인증이 필요합니다.', 401),
    }
  }

  return { userId, error: null }
}

/**
 * 세션 정보와 함께 사용자 ID 가져오기
 *
 * @returns userId, session, 에러 응답
 *
 * @example
 * ```typescript
 * export async function GET() {
 *   const { userId, session, error } = await requireAuthSession()
 *   if (error) return error
 *
 *   // userId와 session을 사용한 로직
 *   return NextResponse.json({ user: session.user })
 * }
 * ```
 */
export async function requireAuthSession(): Promise<{
  userId: string | null
  session: CustomSession | null
  error: NextResponse | null
}> {
  const session = await getSession()
  const userId = session?.userId ?? null

  if (!userId || !session) {
    return {
      userId: null,
      session: null,
      error: createErrorResponse('인증이 필요합니다.', 401),
    }
  }

  return { userId, session, error: null }
}

/**
 * 커뮤니티 멤버 권한 확인
 *
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @param requiredRole - 필요한 역할 (기본: 'member')
 * @returns 권한 여부와 에러 응답
 *
 * @example
 * ```typescript
 * export async function POST(req: Request) {
 *   const { userId, error: authError } = await requireAuthUser()
 *   if (authError) return authError
 *
 *   const { clubId } = await req.json()
 *   const { hasAccess, error } = await requireCommunityAccess(userId!, clubId, 'admin')
 *   if (error) return error
 *
 *   // 관리자 권한이 있는 경우의 로직
 *   return NextResponse.json({ success: true })
 * }
 * ```
 */
export async function requireCommunityAccess(
  userId: string,
  clubId: string,
  requiredRole: 'member' | 'admin' = 'member'
): Promise<{
  hasAccess: boolean
  role: string | null
  error: NextResponse | null
}> {
  const hasAccess = await hasPermission(userId, clubId, requiredRole)

  if (!hasAccess) {
    const roleText = requiredRole === 'admin' ? '팀장' : '멤버'

    return {
      hasAccess: false,
      role: null,
      error: createErrorResponse(`${roleText} 권한이 필요합니다.`, 403),
    }
  }

  const membership = await getUserRole(userId, clubId)

  return {
    hasAccess: true,
    role: membership?.role ?? null,
    error: null,
  }
}

/**
 * 통합 인증 및 권한 확인
 * 인증 + 커뮤니티 접근 권한을 한 번에 확인
 *
 * @param clubId - 커뮤니티 ID
 * @param requiredRole - 필요한 역할 (기본: 'member')
 * @returns userId, role, 에러 응답
 *
 * @example
 * ```typescript
 * export async function DELETE(req: Request, { params }: { params: { id: string } }) {
 *   const { userId, role, error } = await requireAuthAndAccess(params.id, 'owner')
 *   if (error) return error
 *
 *   // 팀장 권한이 확인된 경우의 로직
 *   return NextResponse.json({ success: true })
 * }
 * ```
 */
export async function requireAuthAndAccess(
  clubId: string,
  requiredRole: 'member' | 'admin' = 'member'
): Promise<{
  userId: string | null
  role: string | null
  error: NextResponse | null
}> {
  // 1. 인증 확인
  const { userId, error: authError } = await requireAuthUser()
  if (authError) {
    return { userId: null, role: null, error: authError }
  }

  // 2. 권한 확인
  if (!userId) {
    return { userId: null, role: null, error: createErrorResponse('인증이 필요합니다.', 401) }
  }

  const { role, error: accessError } = await requireCommunityAccess(userId, clubId, requiredRole)
  if (accessError) {
    return { userId, role: null, error: accessError }
  }

  return { userId, role, error: null }
}
