'use server'

/**
 * 출석(Attendance) 도메인 Server Actions
 */

import { ATTENDANCE_TYPES, MESSAGES, PERMISSION_LEVELS, REVALIDATE_PATHS } from '@/constants'
import { getCurrentUserId } from '@/lib/auth'
import { evaluateAttendanceEligibility } from '@/lib/attendance/attendance.core'
import {
  createAttendanceRecord,
  findAttendanceByRoundAndUser,
} from '@/lib/attendance/attendance.server'
import { findRoundById } from '@/lib/rounds/rounds.server'
import {
  assertExists,
  checkPermission,
  ServerActionError,
  type ServerActionResponse,
  withServerAction,
} from '@/lib/utils/serverActions'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: 출석 처리
 */
export async function markAttendanceAction(
  roundId: string,
  clubId: string
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      // 멤버십 확인
      await checkPermission(userId, clubId, PERMISSION_LEVELS.MEMBER)

      // Server I/O: 출석 기록 및 라운드 정보 확인
      const [existingAttendance, round] = await Promise.all([
        findAttendanceByRoundAndUser(roundId, userId),
        findRoundById(roundId, clubId),
      ])

      assertExists(round, MESSAGES.ERROR.ROUND_NOT_FOUND)

      // Core: 출석 적격성 판별 (순수 함수)
      const eligibility = evaluateAttendanceEligibility({
        userId,
        round,
        hasExistingAttendance: Boolean(existingAttendance),
        currentTime: new Date(),
      })
      if (eligibility.isErr()) {
        throw new ServerActionError(eligibility.error.message)
      }

      // Server I/O: 출석 생성
      await createAttendanceRecord({
        round: { connect: { roundId } },
        user: { connect: { userId } },
        attendanceType: ATTENDANCE_TYPES.PRESENT,
        attendanceDate: eligibility.value.attendanceDate,
      })

      revalidatePath(REVALIDATE_PATHS.COMMUNITY(clubId))
    },
    { errorMessage: MESSAGES.ERROR.ATTENDANCE_FAILED }
  )
}
