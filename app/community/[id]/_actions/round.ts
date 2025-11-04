'use server'

import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { CreateRoundRequest } from '@/lib/types/round'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: 라운드 생성
 */
export async function createRoundAction(data: CreateRoundRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: '인증이 필요합니다' }
    }

    // 권한 확인
    const member = await prisma.communityMember.findFirst({
      where: { clubId: data.clubId, userId, role: 'admin' },
    })

    if (!member) {
      return { success: false, error: '권한이 없습니다' }
    }

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
    return { success: true, data: round }
  } catch (error) {
    console.error('Failed to create round:', error)
    return { success: false, error: '라운드 생성에 실패했습니다' }
  }
}

/**
 * Server Action: 라운드 수정
 */
export async function updateRoundAction(
  roundId: string,
  clubId: string,
  data: Partial<CreateRoundRequest>
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: '인증이 필요합니다' }
    }

    // 권한 확인
    const member = await prisma.communityMember.findFirst({
      where: { clubId, userId, role: 'admin' },
    })

    if (!member) {
      return { success: false, error: '권한이 없습니다' }
    }

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
    return { success: true, data: round }
  } catch (error) {
    console.error('Failed to update round:', error)
    return { success: false, error: '라운드 수정에 실패했습니다' }
  }
}

/**
 * Server Action: 라운드 삭제
 */
export async function deleteRoundAction(roundId: string, clubId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: '인증이 필요합니다' }
    }

    // 권한 확인
    const member = await prisma.communityMember.findFirst({
      where: { clubId, userId, role: 'admin' },
    })

    if (!member) {
      return { success: false, error: '권한이 없습니다' }
    }

    // 라운드 삭제
    await prisma.round.delete({
      where: { roundId },
    })

    revalidatePath(`/community/${clubId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete round:', error)
    return { success: false, error: '라운드 삭제에 실패했습니다' }
  }
}

/**
 * Server Action: 출석 처리
 */
export async function markAttendanceAction(roundId: string, clubId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: '인증이 필요합니다' }
    }

    // 멤버십 확인
    const member = await prisma.communityMember.findFirst({
      where: { clubId, userId },
    })

    if (!member) {
      return { success: false, error: '커뮤니티 멤버만 출석할 수 있습니다' }
    }

    // 출석 기록 확인
    const existingAttendance = await prisma.attendance.findFirst({
      where: { roundId, userId },
    })

    if (existingAttendance) {
      return { success: false, error: '이미 출석 처리되었습니다' }
    }

    // 라운드 시간 확인
    const round = await prisma.round.findUnique({
      where: { roundId },
      select: { startDate: true, endDate: true },
    })

    if (!round) {
      return { success: false, error: '라운드를 찾을 수 없습니다' }
    }

    const now = new Date()
    const isWithinWindow =
      round.startDate && round.endDate && now >= round.startDate && now <= round.endDate

    if (!isWithinWindow) {
      return { success: false, error: '출석 가능 시간이 아닙니다' }
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
    return { success: true }
  } catch (error) {
    console.error('Failed to mark attendance:', error)
    return { success: false, error: '출석 처리에 실패했습니다' }
  }
}
