import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import prisma from '@/lib/prisma'
import type { CustomSession } from '@/lib/types'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import { getServerSession } from 'next-auth'
import type { NextRequest } from 'next/server'

interface RouteParams {
  params: Promise<{
    roundId: string
  }>
}

/**
 * GET /api/attendance/round/[roundId]
 * - 특정 라운드의 출석 정보를 조회합니다.
 * - 쿼리 파라미터
 *   - page?: number (기본값: 1)
 *   - limit?: number (기본값: 50, 최대: 100)
 *   - attendanceType?: 'present'|'absent'|'late'|'excused' 출석 타입으로 필터
 *
 * 응답
 * - 200: { success: true, data: Attendance[], count: number, pagination: PaginationInfo, stats: AttendanceStats }
 * - 404: { success: false, error: string }
 * - 500: { success: false, error: string }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const currentUserId = (session as CustomSession)?.userId

    if (!currentUserId) {
      return createErrorResponse('인증이 필요합니다.', 401)
    }

    const { roundId } = await params
    const { searchParams } = new URL(request.url)

    if (!roundId) {
      return createErrorResponse('라운드 ID가 필요합니다.', 400)
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const attendanceType = searchParams.get('attendanceType') as
      | 'present'
      | 'absent'
      | 'late'
      | 'excused'
      | null

    // 라운드 정보 확인 (사용자가 접근 권한이 있는지 확인)
    const round = await prisma.round.findFirst({
      where: {
        roundId,
        community: {
          communityMembers: {
            some: {
              userId: currentUserId,
              deletedAt: null,
            },
          },
        },
      },
      include: {
        community: {
          select: {
            clubId: true,
            name: true,
          },
        },
      },
    })

    if (!round) {
      return createErrorResponse('라운드를 찾을 수 없거나 접근 권한이 없습니다.', 404)
    }

    // 필터 조건 구성
    const where: {
      roundId: string
      deletedAt: null
      attendanceType?: 'present' | 'absent' | 'late' | 'excused'
    } = {
      roundId,
      deletedAt: null,
    }

    if (attendanceType) {
      where.attendanceType = attendanceType
    }

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
      },
      orderBy: {
        attendanceDate: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // 통계 계산
    const stats = await prisma.attendance.groupBy({
      by: ['attendanceType'],
      where: {
        roundId,
        deletedAt: null,
      },
      _count: {
        attendanceId: true,
      },
    })

    const attendanceStats = {
      total: totalCount,
      present: stats.find(s => s.attendanceType === 'present')?._count.attendanceId || 0,
      absent: stats.find(s => s.attendanceType === 'absent')?._count.attendanceId || 0,
      late: stats.find(s => s.attendanceType === 'late')?._count.attendanceId || 0,
      excused: stats.find(s => s.attendanceType === 'excused')?._count.attendanceId || 0,
    }

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
      stats: attendanceStats,
      round: {
        roundId: round.roundId,
        roundNumber: round.roundNumber,
        community: round.community,
      },
    })
  } catch (error) {
    console.error('Error fetching round attendance:', error)
    return createErrorResponse('라운드 출석 정보를 불러오는데 실패했습니다', 500)
  }
}
