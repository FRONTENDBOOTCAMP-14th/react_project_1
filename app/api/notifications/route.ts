/**
 * 공지사항(Notification) 컬렉션 API
 * - 경로: /api/notifications
 * - 메서드:
 *   - GET: 목록 조회(필터링 지원)
 *   - POST: 신규 공지사항 생성
 */

import { MESSAGES } from '@/constants/messages'
import { getCurrentUserId, hasPermission } from '@/lib/auth'
import { validateNotificationCreation } from '@/lib/notifications/notifications.core'
import {
  buildNotificationWhereClause,
  createNotification,
} from '@/lib/notifications/notifications.server'
import prisma from '@/lib/prisma'
import { notificationSelect } from '@/lib/queries'
import type { CreateNotificationRequest } from '@/lib/types/notification'
import { requireAuthUser } from '@/lib/utils/api-auth'
import { getBooleanParam, getPaginationParams, withPagination } from '@/lib/utils/apiHelpers'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import type { NextRequest } from 'next/server'

/**
 * GET /api/notifications
 * - 공지사항 목록을 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clubId = searchParams.get('clubId')
    const isPinned = getBooleanParam(searchParams, 'isPinned')

    // clubId는 필수
    if (!clubId) {
      return createErrorResponse('clubId is required', 400)
    }

    const club = await prisma.community.findFirst({
      where: { clubId, deletedAt: null },
      select: { isPublic: true },
    })

    if (!club) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    if (!club.isPublic) {
      const userId = await getCurrentUserId()
      if (!userId) {
        return createErrorResponse(MESSAGES.ERROR.AUTH_REQUIRED, 401)
      }

      const isMember = await hasPermission(userId, clubId, 'member')
      if (!isMember) {
        return createErrorResponse(MESSAGES.ERROR.FORBIDDEN, 403)
      }
    }

    const { page, limit, skip } = getPaginationParams(request)

    // where 절 구성
    const whereClause = buildNotificationWhereClause(clubId, {
      ...(isPinned !== undefined && { isPinned }),
    })

    // withPagination 유틸리티 사용
    return withPagination(
      prisma.notification.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [
          { isPinned: 'desc' }, // 고정 공지사항 먼저
          { createdAt: 'desc' }, // 최신순
        ],
        select: notificationSelect,
      }),
      prisma.notification.count({ where: whereClause }),
      { page, limit, skip }
    )
  } catch (error) {
    console.error('Error fetching notifications:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to fetch notifications: ${message}`, 500)
  }
}

/**
 * POST /api/notifications
 * - 신규 공지사항을 생성합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    const body = (await request.json()) as CreateNotificationRequest
    const { clubId, title } = body

    // 필수 값 검증
    if (!clubId || !title) {
      return createErrorResponse('Missing required fields: clubId, title', 400)
    }

    // 입력값 검증
    const validation = validateNotificationCreation(body, userId)
    if (validation.isErr()) {
      return createErrorResponse(validation.error.message, 400)
    }

    // 관리자 권한 확인
    const hasAdminPermission = await hasPermission(userId, clubId, 'admin')
    if (!hasAdminPermission) {
      return createErrorResponse('관리자 이상만 공지사항을 생성할 수 있습니다.', 403)
    }

    // 커뮤니티 존재 확인
    const club = await prisma.community.findFirst({
      where: { clubId, deletedAt: null },
      select: { clubId: true },
    })

    if (!club) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    // 공지사항 생성
    const newNotification = await createNotification(validation.value)

    return createSuccessResponse(newNotification, 201)
  } catch (error) {
    console.error('Error creating notification:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_CREATE_NOTIFICATION, 500)
  }
}
