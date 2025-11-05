'use server'

import { ATTENDANCE_TYPES, MESSAGES, PERMISSION_LEVELS, REVALIDATE_PATHS } from '@/constants'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { CreateRoundRequest } from '@/lib/types/round'
import {
  assertExists,
  checkPermission,
  type ServerActionResponse,
  withServerAction,
} from '@/lib/utils/serverActions'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: 라운드 생성
 */
export async function createRoundAction(data: CreateRoundRequest): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      // 관리자 권한 확인
      await checkPermission(userId, data.clubId, PERMISSION_LEVELS.ADMIN)

      // 라운드 생성
      const round = await prisma.round.create({
        data: {
          clubId: data.clubId,
          roundNumber: data.roundNumber,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          location: data.location || null,
        },
      })

      revalidatePath(REVALIDATE_PATHS.COMMUNITY(data.clubId))
      return round
    },
    { errorMessage: MESSAGES.ERROR.ROUND_CREATE_FAILED }
  )
}

/**
 * Server Action: 라운드 수정
 */
export async function updateRoundAction(
  roundId: string,
  clubId: string,
  data: Partial<CreateRoundRequest>
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      // 관리자 권한 확인
      await checkPermission(userId, clubId, PERMISSION_LEVELS.ADMIN)

      // 라운드 업데이트
      const round = await prisma.round.update({
        where: { roundId },
        data: {
          ...(data.roundNumber && { roundNumber: data.roundNumber }),
          ...(data.startDate !== undefined && {
            startDate: data.startDate ? new Date(data.startDate) : null,
          }),
          ...(data.endDate !== undefined && {
            endDate: data.endDate ? new Date(data.endDate) : null,
          }),
          ...(data.location !== undefined && { location: data.location || null }),
        },
      })

      revalidatePath(REVALIDATE_PATHS.COMMUNITY(clubId))
      return round
    },
    { errorMessage: MESSAGES.ERROR.ROUND_UPDATE_FAILED }
  )
}

/**
 * Server Action: 라운드 삭제
 */
export async function deleteRoundAction(
  roundId: string,
  clubId: string
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      // 관리자 권한 확인
      await checkPermission(userId, clubId, PERMISSION_LEVELS.ADMIN)

      // 라운드 소프트 삭제
      await prisma.round.update({
        where: { roundId, deletedAt: null },
        data: { deletedAt: new Date() },
      })

      revalidatePath(REVALIDATE_PATHS.COMMUNITY(clubId))
    },
    { errorMessage: MESSAGES.ERROR.ROUND_DELETE_FAILED }
  )
}

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

      // 출석 기록 확인 (deletedAt 필터 포함)
      const existingAttendance = await prisma.attendance.findFirst({
        where: { roundId, userId, deletedAt: null },
      })

      if (existingAttendance) {
        throw new Error(MESSAGES.ERROR.ALREADY_ATTENDED)
      }

      // 라운드 시간 확인
      const round = await prisma.round.findUnique({
        where: { roundId },
        select: { startDate: true, endDate: true },
      })

      assertExists(round, MESSAGES.ERROR.ROUND_NOT_FOUND)

      const now = new Date()
      const isWithinWindow =
        round.startDate && round.endDate && now >= round.startDate && now <= round.endDate

      if (!isWithinWindow) {
        throw new Error(MESSAGES.ERROR.ATTENDANCE_TIME_INVALID)
      }

      // 출석 생성
      await prisma.attendance.create({
        data: {
          roundId,
          userId,
          attendanceType: ATTENDANCE_TYPES.PRESENT,
          attendanceDate: now,
        },
      })

      revalidatePath(REVALIDATE_PATHS.COMMUNITY(clubId))
    },
    { errorMessage: MESSAGES.ERROR.ATTENDANCE_FAILED }
  )
}
