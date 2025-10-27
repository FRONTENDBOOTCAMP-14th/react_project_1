/**
 * 인증 및 권한 검증 미들웨어
 * - API 라우트에서 사용자 인증과 권한을 확인하는 유틸리티 함수들
 */

import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import prisma from '@/lib/prisma'
import type { CustomSession } from '@/lib/types'
import { createErrorResponse } from '@/lib/utils/response'
import { getServerSession } from 'next-auth'
import type { NextRequest } from 'next/server'

/**
 * 인증된 사용자인지 확인
 * @returns userId 또는 에러 응답
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  const userId = (session as CustomSession)?.userId

  if (!userId) {
    return { error: createErrorResponse('인증이 필요합니다.', 401), userId: null }
  }

  return { error: null, userId }
}

/**
 * 특정 커뮤니티의 멤버인지 확인
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @returns 멤버 여부 또는 에러 응답
 */
export async function requireMembership(userId: string, clubId: string) {
  const membership = await prisma.communityMember.findFirst({
    where: {
      userId,
      clubId,
      deletedAt: null,
    },
    select: {
      id: true,
      role: true,
    },
  })

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
 * @returns 팀장 여부 또는 에러 응답
 */
export async function requireTeamLeader(userId: string, clubId: string) {
  const membership = await prisma.communityMember.findFirst({
    where: {
      userId,
      clubId,
      deletedAt: null,
      role: 'owner',
    },
    select: {
      id: true,
      role: true,
    },
  })

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
 * @returns 커뮤니티 정보 또는 에러 응답
 */
export async function validateCommunity(clubId: string) {
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
 * @param clubId - 커뮤니티 ID (선택)
 * @param requireLeader - 팀장 권한 필요 여부 (기본값: false)
 * @returns 사용자 ID와 멤버십 정보 또는 에러 응답
 */
export async function authMiddleware(
  request: NextRequest,
  options?: {
    clubId?: string
    requireLeader?: boolean
    requireMember?: boolean
  }
) {
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
  if (community.isPublic && !options.requireMember && !options.requireLeader) {
    return { error: null, userId, membership: null }
  }

  // 4. 멤버십 확인
  const { error: memberError, membership } = await requireMembership(userId, options.clubId)
  if (memberError) return { error: memberError, userId: null, membership: null }

  // 5. 팀장 권한 확인 (필요한 경우)
  if (options.requireLeader && membership.role !== 'owner') {
    return {
      error: createErrorResponse('팀장만 접근 가능합니다.', 403),
      userId: null,
      membership: null,
    }
  }

  return { error: null, userId, membership }
}
