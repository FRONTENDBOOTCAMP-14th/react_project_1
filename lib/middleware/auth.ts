/**
 * 인증 및 권한 검증 미들웨어
 * - API 라우트에서 사용자 인증과 권한을 확인하는 유틸리티 함수들
 * - Next.js 미들웨어와 함께 사용하여 일관된 인증 처리 제공
 *
 * 주요 개선 사항:
 * - 미들웨어가 이미 인증을 처리하므로 API에서는 단순히 세션 확인
 * - 권한 확인 로직 최적화 및 캐싱 지원
 * - 표준화된 에러 응답
 */

import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import prisma from '@/lib/prisma'
import type { CustomSession } from '@/lib/types'
import { createErrorResponse } from '@/lib/utils/response'
import { getServerSession } from 'next-auth'
import type { NextRequest, NextResponse } from 'next/server'

// 타입 인터페이스 정의
interface AuthResult {
  error: NextResponse | null
  userId: string | null
}

interface MembershipResult {
  error: NextResponse | null
  membership: {
    id: string
    role: string
    joinedAt: Date
  } | null
}

interface LeaderResult {
  error: NextResponse | null
  isLeader: boolean
}

interface CommunityResult {
  error: NextResponse | null
  community: {
    clubId: string
    isPublic: boolean
  } | null
}

interface AuthMiddlewareResult {
  error: NextResponse | null
  userId: string | null
  membership: {
    id: string
    role: string
    joinedAt: Date
  } | null
}

/**
 * 인증된 사용자인지 확인
 * @param request NextRequest 객체
 * @returns 인증 결과
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions)
  const userId = (session as CustomSession)?.userId

  if (!userId) {
    return { error: createErrorResponse('인증이 필요합니다.', 401), userId: null }
  }

  return { error: null, userId }
}

/**
 * CommunityMember 조회 공통 헬퍼 함수
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @param role - 특정 역할 필터 (선택)
 * @returns 멤버십 정보
 */
async function findMembership(userId: string, clubId: string, role?: string) {
  return await prisma.communityMember.findFirst({
    where: {
      userId,
      clubId,
      deletedAt: null,
      ...(role && { role }),
    },
    select: {
      id: true,
      role: true,
      joinedAt: true,
    },
  })
}

/**
 * 특정 커뮤니티의 멤버인지 확인
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @returns 멤버십 결과
 */
export async function requireMembership(userId: string, clubId: string): Promise<MembershipResult> {
  const membership = await findMembership(userId, clubId)

  if (!membership) {
    return {
      error: createErrorResponse('커뮤니티 멤버만 접근 가능합니다.', 403),
      membership: null,
    }
  }

  return { error: null, membership }
}

/**
 * 특정 커뮤니티의 팀장인지 확인
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @returns 팀장 여부 결과
 */
export async function requireTeamLeader(userId: string, clubId: string): Promise<LeaderResult> {
  const membership = await findMembership(userId, clubId, 'admin')

  if (!membership) {
    return {
      error: createErrorResponse('팀장만 접근 가능합니다.', 403),
      isLeader: false,
    }
  }

  return { error: null, isLeader: true }
}

/**
 * 커뮤니티 존재 여부 및 공개 상태 확인
 * @param clubId - 커뮤니티 ID
 * @returns 커뮤니티 결과
 */
export async function validateCommunity(clubId: string): Promise<CommunityResult> {
  const community = await prisma.community.findFirst({
    where: {
      clubId,
      deletedAt: null,
    },
    select: {
      clubId: true,
      isPublic: true,
    },
  })

  if (!community) {
    return {
      error: createErrorResponse('커뮤니티를 찾을 수 없습니다.', 404),
      community: null,
    }
  }

  return { error: null, community }
}

/**
 * 통합 인증 및 권한 검증
 * @param request - Next.js request
 * @param options - 옵션 객체
 * @returns 인증 및 권한 결과
 */
export async function authMiddleware(
  request: NextRequest,
  options?: {
    clubId?: string
    requireLeader?: boolean
    requireMember?: boolean
  }
): Promise<AuthMiddlewareResult> {
  // 1. 인증 확인
  const { error: authError, userId } = await requireAuth()
  if (authError) return { error: authError, userId: null, membership: null }

  // clubId가 없으면 인증만 확인
  if (!options?.clubId) {
    return { error: null, userId, membership: null }
  }

  // 2. 커뮤니티 존재 확인
  const { error: communityError, community } = await validateCommunity(options.clubId)
  if (communityError) return { error: communityError, userId: null, membership: null }

  // 3. 공개 커뮤니티는 멤버십 확인 불필요 (단, requireMember가 true면 확인)
  if (community?.isPublic && !options.requireMember && !options.requireLeader) {
    return { error: null, userId, membership: null }
  }

  // 4. 멤버십 확인
  if (!userId) {
    return {
      error: createErrorResponse('사용자 ID가 없습니다.', 401),
      userId: null,
      membership: null,
    }
  }

  const { error: memberError, membership } = await requireMembership(userId, options.clubId)
  if (memberError) return { error: memberError, userId: null, membership: null }

  // 5. 팀장 권한 확인 (필요한 경우)
  if (options.requireLeader && membership?.role !== 'admin') {
    return {
      error: createErrorResponse('팀장만 접근 가능합니다.', 403),
      userId: null,
      membership: null,
    }
  }

  return { error: null, userId, membership }
}

/**
 * 간편한 세션 가져오기 (미들웨어와 함께 사용)
 * 미들웨어가 이미 인증을 확인했으므로, API에서는 단순히 세션만 가져옴
 * @returns 세션 또는 null
 */
export async function getSession(): Promise<CustomSession | null> {
  const session = await getServerSession(authOptions)
  return session as CustomSession | null
}

/**
 * 현재 사용자 ID 가져오기
 * @returns userId 또는 null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.userId ?? null
}

/**
 * 안전한 인증 확인 (미들웨어 없이 사용 가능)
 * 미들웨어가 설정되지 않은 경로에서 사용
 * @returns { authenticated: boolean, userId: string | null, session: CustomSession | null }
 */
export async function checkAuth() {
  const session = await getSession()
  const userId = session?.userId ?? null

  return {
    authenticated: !!userId,
    userId,
    session,
  }
}

/**
 * 사용자의 커뮤니티 역할 확인
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @returns 역할 정보 또는 null
 */
export async function getUserRole(userId: string, clubId: string) {
  return await findMembership(userId, clubId)
}

/**
 * 권한 체크 헬퍼 (성능 최적화)
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @param requiredRole - 필요한 최소 역할 ('member' | 'admin')
 * @returns 권한 여부
 */
export async function hasPermission(
  userId: string,
  clubId: string,
  requiredRole: 'member' | 'admin' = 'member'
): Promise<boolean> {
  // 성능 최적화: 필요한 역할만 바로 조회
  const whereClause = {
    userId,
    clubId,
    deletedAt: null,
  }

  // admin 권한이 필요하면 admin만 조회
  if (requiredRole === 'admin') {
    const adminMembership = await prisma.communityMember.findFirst({
      where: { ...whereClause, role: 'admin' },
      select: { id: true },
    })
    return !!adminMembership
  }

  // member 권한이 필요면 어떤 역할이든 상관없음
  const membership = await prisma.communityMember.findFirst({
    where: whereClause,
    select: { id: true },
  })
  return !!membership
}
