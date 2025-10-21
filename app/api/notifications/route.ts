/**
 * 공지사항(Notification) 컬렉션 API
 * - 경로: /api/notifications
 * - 메서드:
 *   - GET: 목록 조회(필터링 지원)
 *   - POST: 신규 공지사항 생성
 *
 * 주의사항
 * - 소프트 삭제(deletedAt !== null)는 목록에서 제외합니다.
 * - 모든 응답은 JSON 형태이며, 성공 여부(success)와 데이터/메시지를 포함합니다.
 */

import prisma from '@/lib/prisma'
import { notificationSelect, activeNotificationWhere } from '@/lib/quaries'
import type { CreateNotificationRequest } from '@/lib/types/notification'
import type { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import { MESSAGES } from '@/constants/messages'
import type { PaginationInfo } from '@/lib/types'

/**
 * GET /api/notifications
 * - 공지사항 목록을 조회합니다.
 * - 쿼리 파라미터
 *   - clubId?: string  특정 커뮤니티(클럽) ID로 필터 (필수)
 *   - isPinned?: boolean  고정 공지사항만 조회
 *
 * 응답
 * - 200: { success: true, data: Notification[], count: number, pagination: {...} }
 * - 400: { success: false, error: string }
 * - 500: { success: false, error: string, message?: string }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clubId = searchParams.get('clubId')
    const isPinnedParam = searchParams.get('isPinned')

    // clubId는 필수
    if (!clubId) {
      return createErrorResponse('clubId is required', 400)
    }

    // 페이지네이션 파라미터
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    // where 절 구성
    const whereClause = {
      ...activeNotificationWhere,
      clubId,
      ...(isPinnedParam !== null && { isPinned: isPinnedParam === 'true' }),
    }

    // 병렬 조회: 데이터 + 전체 갯수
    const [notifications, total] = await Promise.all([
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
    ])

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }

    return createSuccessResponse({
      data: notifications,
      count: notifications.length,
      pagination,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to fetch notifications: ${message}`, 500)
  }
}

/**
 * POST /api/notifications
 * - 신규 공지사항을 생성합니다.
 *
 * 요청 Body 예시
 * {
 *   "clubId": "커뮤니티ID(필수)",
 *   "authorId": "작성자ID(필수)",
 *   "title": "공지사항 제목(필수)",
 *   "content": "공지사항 내용(선택)",
 *   "isPinned": false  // 상단 고정 여부(선택, 기본값 false)
 * }
 *
 * 응답
 * - 201: { success: true, data: Notification }
 * - 400: { success: false, error: 'Missing required fields', required: [...] }
 * - 404: { success: false, error: 'Community not found' }
 * - 500: { success: false, error: string, message?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateNotificationRequest
    const { clubId, authorId, title, content, isPinned } = body

    // 필수 값 검증
    if (!clubId || !authorId || !title) {
      return createErrorResponse('Missing required fields: clubId, authorId, title', 400)
    }

    // 제목 길이 검증
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return createErrorResponse('Title cannot be empty', 400)
    }

    // clubId 존재 확인
    const club = await prisma.community.findFirst({
      where: { clubId, deletedAt: null },
      select: { clubId: true },
    })

    if (!club) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    // authorId 존재 확인
    const author = await prisma.user.findFirst({
      where: { userId: authorId, deletedAt: null },
      select: { userId: true },
    })

    if (!author) {
      return createErrorResponse('Author not found', 404)
    }

    const newNotification = await prisma.notification.create({
      data: {
        clubId,
        authorId,
        title: trimmedTitle,
        content: content?.trim() || null,
        isPinned: isPinned ?? false,
      },
      select: notificationSelect,
    })

    return createSuccessResponse(newNotification, 201)
  } catch (error) {
    console.error('Error creating notification:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_CREATE_NOTIFICATION, 500)
  }
}
