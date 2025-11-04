'use server'

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
      assertExists(userId, '인증이 필요합니다')

      // 관리자 권한 확인
      await checkPermission(userId, data.clubId, 'admin')

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

      revalidatePath(`/community/${data.clubId}`)
      return round
    },
    { errorMessage: '라운드 생성에 실패했습니다' }
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
      assertExists(userId, '인증이 필요합니다')

      // 관리자 권한 확인
      await checkPermission(userId, clubId, 'admin')

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

      revalidatePath(`/community/${clubId}`)
      return round
    },
    { errorMessage: '라운드 수정에 실패했습니다' }
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
      assertExists(userId, '인증이 필요합니다')

      // 관리자 권한 확인
      await checkPermission(userId, clubId, 'admin')

      // 라운드 삭제
      await prisma.round.delete({
        where: { roundId },
      })

      revalidatePath(`/community/${clubId}`)
    },
    { errorMessage: '라운드 삭제에 실패했습니다' }
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
      assertExists(userId, '인증이 필요합니다')

      // 멤버십 확인
      await checkPermission(userId, clubId, 'member')

      // 출석 기록 확인
      const existingAttendance = await prisma.attendance.findFirst({
        where: { roundId, userId },
      })

      if (existingAttendance) {
        throw new Error('이미 출석 처리되었습니다')
      }

      // 라운드 시간 확인
      const round = await prisma.round.findUnique({
        where: { roundId },
        select: { startDate: true, endDate: true },
      })

      assertExists(round, '라운드를 찾을 수 없습니다')

      const now = new Date()
      const isWithinWindow =
        round.startDate && round.endDate && now >= round.startDate && now <= round.endDate

      if (!isWithinWindow) {
        throw new Error('출석 가능 시간이 아닙니다')
      }

      // 출석 생성
      await prisma.attendance.create({
        data: {
          roundId,
          userId,
          attendanceType: 'present',
          attendanceDate: now,
        },
      })

      revalidatePath(`/community/${clubId}`)
    },
    { errorMessage: '출석 처리에 실패했습니다' }
  )
}
