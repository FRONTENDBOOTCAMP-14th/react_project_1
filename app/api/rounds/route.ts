/**
 * 회차(Round) 컬렉션 API
 * - 경로: /api/rounds
 * - 메서드:
 *   - GET: 목록 조회(필터링 지원)
 *   - POST: 신규 회차 생성
 *
 * 주의사항
 * - 소프트 삭제(deletedAt !== null)는 목록에서 제외합니다.
 * - 모든 응답은 JSON 형태이며, 성공 여부(success)와 데이터/메시지를 포함합니다.
 */

import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { MESSAGES } from '@/constants/messages'
import { checkIsMember, checkIsTeamLeader } from '@/lib/auth/permissions'
import prisma from '@/lib/prisma'
import { roundSelect } from '@/lib/quaries'
import type { CustomSession } from '@/lib/types'
import type { CreateRoundRequest } from '@/lib/types/round'
import { getPaginationParams, withPagination } from '@/lib/utils/apiHelpers'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import { buildRoundWhereClause, getNextRoundNumber } from '@/lib/utils/rounds'
import { getServerSession } from 'next-auth'
import type { NextRequest } from 'next/server'

/**
 * GET /api/rounds
 * - 회차 목록을 조회합니다.
 * - 쿼리 파라미터
 *   - clubId: string  특정 커뮤니티(클럽) ID로 필터 (필수)
 *   - page: number   페이지 번호 (기본값: 1)
 *   - limit: number  페이지당 항목 수 (1-100, 기본값: 10)
 *   - roundNumber: number  특정 회차 번호로 필터
 *   - startDateFrom: string  시작일 범위 시작 (ISO 8601)
 *   - startDateTo: string    시작일 범위 종료 (ISO 8601)
 *   - endDateFrom: string    종료일 범위 시작 (ISO 8601)
 *   - endDateTo: string      종료일 범위 종료 (ISO 8601)
 *
 * 응답
 * - 200: { success: true, data: Round[], count: number, pagination: PaginationInfo }
 * - 400: { success: false, error: '클럽 ID는 필수입니다.' }
 * - 401: { success: false, error: '인증이 필요합니다.' }
 * - 403: { success: false, error: '접근 권한이 없습니다. 이 커뮤니티의 멤버가 아닙니다.' }
 * - 404: { success: false, error: '커뮤니티를 찾을 수 없습니다.' }
 * - 500: { success: false, error: string, message?: string }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clubId = searchParams.get('clubId')

    // clubId 필수 검증
    if (!clubId) {
      return createErrorResponse('클럽 ID는 필수입니다.', 400)
    }

    // 커뮤니티 존재 여부 및 공개 여부 확인
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
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    // 비공개 커뮤니티의 경우 멤버 권한 확인
    if (!community.isPublic) {
      const session = await getServerSession(authOptions)
      const userId = (session as CustomSession)?.userId

      if (!userId) {
        return createErrorResponse('인증이 필요합니다.', 401)
      }

      // 멤버 여부 확인 (최적화된 함수 사용)
      const isMember = await checkIsMember(userId, clubId)
      if (!isMember) {
        return createErrorResponse('접근 권한이 없습니다. 이 커뮤니티의 멤버가 아닙니다.', 403)
      }
    }

    // 페이지네이션 파라미터
    const { page, limit, skip } = getPaginationParams(request)

    // 추가 필터링 파라미터
    const roundNumber = searchParams.get('roundNumber')
    const startDateFrom = searchParams.get('startDateFrom')
    const startDateTo = searchParams.get('startDateTo')
    const endDateFrom = searchParams.get('endDateFrom')
    const endDateTo = searchParams.get('endDateTo')

    // where 절 구성 (유틸리티 함수 사용)
    const whereClause = buildRoundWhereClause(clubId, {
      roundNumber,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
    })

    // withPagination 유틸리티 사용
    return withPagination(
      prisma.round.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: roundSelect,
      }),
      prisma.round.count({ where: whereClause }),
      { page, limit, skip }
    )
  } catch (error) {
    console.error('Error fetching rounds:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_LOAD_ROUNDS, 500)
  }
}

/**
 * POST /api/rounds
 * - 신규 회차를 생성합니다.
 * - 권한: 팀장만 가능
 *
 * 요청 Body 예시
 * {
 *   "clubId": "커뮤니티ID(필수)",
 *   "roundNumber": 1,  // 회차 번호(선택, 기본값 1)
 *   "startDate": "2025-10-20T14:00:00Z",  // 시작 일시(선택)
 *   "endDate": "2025-10-20T18:00:00Z",    // 종료 일시(선택)
 *   "location": "서울 강남구 스터디카페"  // 장소(선택)
 * }
 *
 * 응답
 * - 201: { success: true, data: Round }
 * - 400: { success: false, error: 'Missing required fields', required: [...] }
 * - 401: { success: false, error: 'Authentication required' }
 * - 403: { success: false, error: 'Only team leaders can create rounds' }
 * - 404: { success: false, error: 'Community not found' }
 * - 500: { success: false, error: string, message?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateRoundRequest
    const { clubId, roundNumber, startDate, endDate, location } = body

    // 필수 값 검증
    if (!clubId) {
      return createErrorResponse('필수 필드가 누락되었습니다: clubId', 400)
    }

    // roundNumber 유효성 검증
    if (roundNumber !== undefined && (roundNumber < 1 || !Number.isInteger(roundNumber))) {
      return createErrorResponse('roundNumber는 양의 정수여야 합니다.', 400)
    }

    // clubId 존재 확인
    const club = await prisma.community.findFirst({
      where: { clubId, deletedAt: null },
      select: { clubId: true },
    })

    if (!club) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    // 날짜 유효성 검증
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start > end) {
        return createErrorResponse('시작일은 종료일보다 이전이거나 같아야 합니다.', 400)
      }
    }

    // 인증 확인
    const session = await getServerSession(authOptions)
    const userId = (session as CustomSession)?.userId
    if (!userId) {
      return createErrorResponse('인증이 필요합니다.', 401)
    }

    // 팀장 권한 확인
    const isTeamLeader = await checkIsTeamLeader(userId, clubId)
    if (!isTeamLeader) {
      return createErrorResponse('팀장만 회차를 생성할 수 있습니다.', 403)
    }

    // roundNumber 자동 증가 로직 (사용자가 지정하지 않은 경우)
    let finalRoundNumber = roundNumber ?? 1
    if (roundNumber === undefined) {
      finalRoundNumber = await getNextRoundNumber(clubId)
    }

    // 최종 roundNumber 유효성 검증
    if (finalRoundNumber < 1 || !Number.isInteger(finalRoundNumber)) {
      return createErrorResponse('roundNumber는 양의 정수여야 합니다.', 400)
    }

    const newRound = await prisma.round.create({
      data: {
        clubId,
        roundNumber: finalRoundNumber,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
      },
      select: roundSelect,
    })

    return createSuccessResponse(newRound, 201)
  } catch (error) {
    console.error('Error creating round:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_CREATE_ROUND, 500)
  }
}
