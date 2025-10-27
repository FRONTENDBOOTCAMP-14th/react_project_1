import prisma from '@/lib/prisma'
import type { CreateAttendanceInput } from '@/lib/types/attendance'
import { buildAttendanceWhereClause, buildAttendanceCreateData } from '@/lib/utils/attendance'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import { requireAuthUser } from '@/lib/utils/api-auth'
import type { NextRequest } from 'next/server'

/**
 * GET /api/attendance
 * - 출석 목록을 조회합니다.
 * - 쿼리 파라미터
 *   - page?: number (기본값: 1)
 *   - limit?: number (기본값: 10, 최대: 100)
 *   - userId?: string 특정 사용자로 필터
 *   - roundId?: string 특정 라운드로 필터
 *   - attendanceType?: 'present'|'absent'|'late'|'excused' 출석 타입으로 필터
 *   - attendanceDateFrom?: string (ISO 8601) 출석일 시작 범위
 *   - attendanceDateTo?: string (ISO 8601) 출석일 종료 범위
 *
 * 응답
 * - 200: { success: true, data: Attendance[], count: number, pagination: PaginationInfo }
 * - 500: { success: false, error: string }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const userId = searchParams.get('userId')
    const roundId = searchParams.get('roundId')
    const attendanceType = searchParams.get('attendanceType') as
      | 'present'
      | 'absent'
      | 'late'
      | 'excused'
      | null

    // 명확한 파라미터 이름 사용: attendanceDateFrom, attendanceDateTo
    const attendanceDateFrom =
      searchParams.get('attendanceDateFrom') || searchParams.get('startDate') // 하위 호환성
    const attendanceDateTo = searchParams.get('attendanceDateTo') || searchParams.get('endDate') // 하위 호환성

    // 필터 조건 구성
    const filters = {
      userId: userId || undefined,
      roundId: roundId || undefined,
      attendanceType: attendanceType || undefined,
      startDate: attendanceDateFrom ? new Date(attendanceDateFrom) : undefined,
      endDate: attendanceDateTo ? new Date(attendanceDateTo) : undefined,
    }

    const where = buildAttendanceWhereClause(filters)

    // 총 개수 조회
    const totalCount = await prisma.attendance.count({ where })

    // 출석 목록 조회
    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            nickname: true,
            email: true,
          },
        },
        round: {
          select: {
            roundId: true,
            roundNumber: true,
            startDate: true,
            endDate: true,
            location: true,
            community: {
              select: {
                clubId: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        attendanceDate: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    const totalPages = Math.ceil(totalCount / limit)

    return createSuccessResponse({
      data: attendance,
      count: totalCount,
      pagination: {
        page,
        limit,
        totalPages,
        total: totalCount,
      },
    })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return createErrorResponse('출석 정보를 불러오는데 실패했습니다', 500)
  }
}

/**
 * POST /api/attendance
 * - 출석을 생성합니다.
 *
 * 요청 바디
 * - userId: string (필수) 사용자 ID
 * - roundId: string (필수) 라운드 ID
 * - attendanceType: 'present'|'absent'|'late'|'excused' (필수) 출석 타입
 * - attendanceDate?: Date 출석 날짜 (기본값: 현재 시간)
 *
 * 응답
 * - 201: { success: true, data: Attendance }
 * - 400: { success: false, error: string }
 * - 500: { success: false, error: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const { userId: currentUserId, error: authError } = await requireAuthUser()
    if (authError || !currentUserId)
      return authError || createErrorResponse('인증이 필요합니다.', 401)

    const body: CreateAttendanceInput = await request.json()
    const { userId, roundId, attendanceType, attendanceDate } = body

    // 필수 필드 검증
    if (!userId || !roundId || !attendanceType) {
      return createErrorResponse('userId, roundId, attendanceType은 필수입니다.', 400)
    }

    // 유효한 출석 타입인지 확인
    if (!['present', 'absent', 'late', 'excused'].includes(attendanceType)) {
      return createErrorResponse('유효하지 않은 출석 타입입니다.', 400)
    }

    // 라운드와 사용자가 존재하는지 확인
    const [round, user] = await Promise.all([
      prisma.round.findUnique({ where: { roundId } }),
      prisma.user.findUnique({ where: { userId } }),
    ])

    if (!round) {
      return createErrorResponse('존재하지 않는 라운드입니다.', 404)
    }

    if (!user) {
      return createErrorResponse('존재하지 않는 사용자입니다.', 404)
    }

    // 이미 출석이 있는지 확인
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        roundId_userId: {
          roundId,
          userId,
        },
      },
    })

    if (existingAttendance) {
      return createErrorResponse('이미 해당 라운드에 출석 정보가 있습니다.', 409)
    }

    // 출석 생성
    const attendance = await prisma.attendance.create({
      data: buildAttendanceCreateData({
        userId,
        roundId,
        attendanceType,
        attendanceDate: attendanceDate ? new Date(attendanceDate) : undefined,
      }),
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            nickname: true,
            email: true,
          },
        },
        round: {
          select: {
            roundId: true,
            roundNumber: true,
            startDate: true,
            endDate: true,
            location: true,
            community: {
              select: {
                clubId: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return createSuccessResponse(attendance, 201)
  } catch (error) {
    console.error('Error creating attendance:', error)
    return createErrorResponse('출석 생성에 실패했습니다', 500)
  }
}
