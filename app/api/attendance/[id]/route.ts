import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import prisma from '@/lib/prisma'
import type { CustomSession } from '@/lib/types'
import type { UpdateAttendanceInput } from '@/lib/types/attendance'
import { buildAttendanceUpdateData } from '@/lib/utils/attendance'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import { getServerSession } from 'next-auth'
import type { NextRequest } from 'next/server'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/attendance/[id]
 * - 특정 출석 정보를 조회합니다.
 *
 * 응답
 * - 200: { success: true, data: Attendance }
 * - 404: { success: false, error: string }
 * - 500: { success: false, error: string }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    if (!id) {
      return createErrorResponse('출석 ID가 필요합니다.', 400)
    }

    const attendance = await prisma.attendance.findUnique({
      where: { attendanceId: id },
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

    if (!attendance) {
      return createErrorResponse('출석 정보를 찾을 수 없습니다.', 404)
    }

    return createSuccessResponse(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return createErrorResponse('출석 정보를 불러오는데 실패했습니다', 500)
  }
}

/**
 * PATCH /api/attendance/[id]
 * - 출석 정보를 수정합니다.
 *
 * 요청 바디
 * - attendanceType?: 'present'|'absent'|'late'|'excused' 출석 타입
 * - attendanceDate?: Date 출석 날짜
 *
 * 응답
 * - 200: { success: true, data: Attendance }
 * - 400: { success: false, error: string }
 * - 404: { success: false, error: string }
 * - 500: { success: false, error: string }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const currentUserId = (session as CustomSession)?.userId

    if (!currentUserId) {
      return createErrorResponse('인증이 필요합니다.', 401)
    }

    const { id } = params

    if (!id) {
      return createErrorResponse('출석 ID가 필요합니다.', 400)
    }

    const body: UpdateAttendanceInput = await request.json()
    const { attendanceType, attendanceDate } = body

    // 유효한 출석 타입인지 확인
    if (attendanceType && !['present', 'absent', 'late', 'excused'].includes(attendanceType)) {
      return createErrorResponse('유효하지 않은 출석 타입입니다.', 400)
    }

    // 출석 정보 확인
    const existingAttendance = await prisma.attendance.findUnique({
      where: { attendanceId: id },
    })

    if (!existingAttendance) {
      return createErrorResponse('출석 정보를 찾을 수 없습니다.', 404)
    }

    // 업데이트 데이터 구성
    const updateData = buildAttendanceUpdateData({
      attendanceType,
      attendanceDate: attendanceDate ? new Date(attendanceDate) : undefined,
    })

    // 출석 수정
    const attendance = await prisma.attendance.update({
      where: { attendanceId: id },
      data: updateData,
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

    return createSuccessResponse(attendance)
  } catch (error) {
    console.error('Error updating attendance:', error)
    return createErrorResponse('출석 수정에 실패했습니다', 500)
  }
}

/**
 * DELETE /api/attendance/[id]
 * - 출석을 삭제합니다 (소프트 삭제).
 *
 * 응답
 * - 200: { success: true }
 * - 404: { success: false, error: string }
 * - 500: { success: false, error: string }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const currentUserId = (session as CustomSession)?.userId

    if (!currentUserId) {
      return createErrorResponse('인증이 필요합니다.', 401)
    }

    const { id } = params

    if (!id) {
      return createErrorResponse('출석 ID가 필요합니다.', 400)
    }

    // 출석 정보 확인
    const existingAttendance = await prisma.attendance.findUnique({
      where: { attendanceId: id },
    })

    if (!existingAttendance) {
      return createErrorResponse('출석 정보를 찾을 수 없습니다.', 404)
    }

    // 소프트 삭제
    await prisma.attendance.update({
      where: { attendanceId: id },
      data: { deletedAt: new Date() },
    })

    return createSuccessResponse({ success: true })
  } catch (error) {
    console.error('Error deleting attendance:', error)
    return createErrorResponse('출석 삭제에 실패했습니다', 500)
  }
}
