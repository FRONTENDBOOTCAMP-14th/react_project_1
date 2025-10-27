/**
 * 소프트 삭제 유틸리티 함수
 * - 모든 삭제 API에서 일관된 소프트 삭제 정책 적용
 */

import prisma from '@/lib/prisma'
import { hasErrorCode } from '@/lib/errors'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'

/**
 * 소프트 삭제 실행 헬퍼
 * @param model - Prisma model명
 * @param id - 삭제할 레코드 ID
 * @param idField - ID 필드명 (기본값: 해당 모델의 primary key)
 * @returns 성공/실패 응답
 */
export async function executeSoftDelete<T extends keyof typeof prisma>(
  model: T,
  id: string,
  idField: string
) {
  try {
    // @ts-expect-error - Dynamic Prisma model access
    await prisma[model].update({
      where: {
        [idField]: id,
        deletedAt: null, // 이미 삭제된 레코드는 업데이트 불가
      },
      data: { deletedAt: new Date() },
    })

    return { success: true, response: createSuccessResponse({ message: 'Deleted successfully' }) }
  } catch (error: unknown) {
    // Prisma P2025: Record not found
    if (hasErrorCode(error, 'P2025')) {
      return {
        success: false,
        response: createErrorResponse('Record not found or already deleted', 404),
      }
    }

    console.error(`Error soft deleting ${String(model)}:`, error)
    return { success: false, response: createErrorResponse('Failed to delete', 500) }
  }
}

/**
 * 소프트 삭제 헬퍼 (구체적인 모델용)
 */
export const softDeleteHelpers = {
  /**
   * 목표 소프트 삭제
   */
  async deleteGoal(goalId: string) {
    return executeSoftDelete('studyGoal', goalId, 'goalId')
  },

  /**
   * 커뮤니티 소프트 삭제
   */
  async deleteCommunity(clubId: string) {
    return executeSoftDelete('community', clubId, 'clubId')
  },

  /**
   * 멤버 소프트 삭제
   */
  async deleteMember(id: string) {
    return executeSoftDelete('communityMember', id, 'id')
  },

  /**
   * 라운드 소프트 삭제
   */
  async deleteRound(roundId: string) {
    return executeSoftDelete('round', roundId, 'roundId')
  },

  /**
   * 공지사항 소프트 삭제
   */
  async deleteNotification(notificationId: string) {
    return executeSoftDelete('notification', notificationId, 'notificationId')
  },

  /**
   * 출석 소프트 삭제
   */
  async deleteAttendance(attendanceId: string) {
    return executeSoftDelete('attendance', attendanceId, 'attendanceId')
  },
}
