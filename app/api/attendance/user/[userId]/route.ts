import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import prisma from '@/lib/prisma'
import type { CustomSession } from '@/lib/types'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import type { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import type { NextRequest } from 'next/server'

interface RouteParams {
  params: Promise<{
    userId: string
  }>
}

/**
 * GET /api/attendance/user/[userId]
 * - 특정 사용자의 출석 기록을 조회합니다.
 * - 쿼리 파라미터
 *   - page?: number (기본값: 1)
 *   - limit?: number (기본값: 10, 최대: 100)
 *   - attendanceType?: 'present'|'absent'|'late'|'excused' 출석 타입으로 필터
 *   - startDate?: string (ISO 8601) 시작일 이후로 필터
 *   - endDate?: string (ISO 8601) 종료일 이전으로 필터
 *   - clubId?: string 특정 커뮤니티로 필터
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

    const { userId } = await params
    const { searchParams } = new URL(request.url)

    if (!userId) {
      return createErrorResponse('사용자 ID가 필요합니다.', 400)
    }

    // 접근 권한 확인 (본인 정보만 조회 가능)
    if (currentUserId !== userId) {
      return createErrorResponse('본인의 출석 기록만 조회할 수 있습니다.', 403)
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const attendanceType = searchParams.get('attendanceType') as
      | 'present'
      | 'absent'
      | 'late'
      | 'excused'
      | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const clubId = searchParams.get('clubId')

    // 필터 조건 구성
    const where: {
      userId: string
      deletedAt: null
      attendanceType?: 'present' | 'absent' | 'late' | 'excused'
      attendanceDate?: Prisma.DateTimeFilter
      round?: {
        clubId: string
        deletedAt: null
      }
    } = {
      userId,
      deletedAt: null,
    }

    if (attendanceType) {
      where.attendanceType = attendanceType
    }

    if (startDate || endDate) {
      where.attendanceDate = {}
      if (startDate) {
        where.attendanceDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.attendanceDate.lte = new Date(endDate)
      }
    }

    if (clubId) {
      where.round = {
        clubId,
        deletedAt: null,
      }
    }

    // 총 개수 조회
    const totalCount = await prisma.attendance.count({ where })

    // 출석 목록 조회
    const attendance = await prisma.attendance.findMany({
      where,
      include: {
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

    // 통계 계산
    const stats = await prisma.attendance.groupBy({
      by: ['attendanceType'],
      where: {
        userId,
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
    })
  } catch (error) {
    console.error('Error fetching user attendance:', error)
    return createErrorResponse('사용자 출석 정보를 불러오는데 실패했습니다', 500)
  }
}
