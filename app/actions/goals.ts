'use server'

import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { CreateGoalInput, UpdateGoalInput } from '@/lib/types/goal'
import {
  assertExists,
  type ServerActionResponse,
  withServerAction,
} from '@/lib/utils/serverActions'
import { MESSAGES, GOAL_STATUS, REVALIDATE_PATHS } from '@/constants'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: 목표 생성
 */
export async function createGoalAction(data: CreateGoalInput): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      // 날짜 변환
      const start = data.startDate instanceof Date ? data.startDate : new Date(data.startDate)
      const end = data.endDate instanceof Date ? data.endDate : new Date(data.endDate)

      const newGoal = await prisma.studyGoal.create({
        data: {
          ownerId: userId, // 인증된 사용자로 자동 설정
          clubId: data.clubId || null,
          roundId: data.roundId || null,
          title: data.title,
          description: data.description || null,
          isTeam: data.isTeam || GOAL_STATUS.ACTIVE,
          isComplete: data.isComplete || GOAL_STATUS.ACTIVE,
          startDate: start,
          endDate: end,
        },
      })

      // 연관된 경로 재검증
      if (data.clubId) {
        revalidatePath(REVALIDATE_PATHS.COMMUNITY(data.clubId))
      }

      return newGoal
    },
    { errorMessage: MESSAGES.ERROR.GOAL_CREATE_FAILED }
  )
}

/**
 * Server Action: 목표 수정
 */
export async function updateGoalAction(
  goalId: string,
  data: UpdateGoalInput
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      // 목표 존재 및 소유자 확인
      const existingGoal = await prisma.studyGoal.findFirst({
        where: { goalId, deletedAt: null },
        select: { ownerId: true, clubId: true },
      })

      assertExists(existingGoal, '목표를 찾을 수 없습니다')

      if (existingGoal.ownerId !== userId) {
        throw new Error('목표 소유자만 수정할 수 있습니다')
      }

      // 동적 업데이트 데이터 구성
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      }

      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined) updateData.description = data.description
      if (data.isTeam !== undefined) updateData.isTeam = data.isTeam
      if (data.isComplete !== undefined) updateData.isComplete = data.isComplete
      if (data.roundId !== undefined) updateData.roundId = data.roundId
      if (data.startDate !== undefined) {
        updateData.startDate =
          data.startDate instanceof Date ? data.startDate : new Date(data.startDate)
      }
      if (data.endDate !== undefined) {
        updateData.endDate = data.endDate instanceof Date ? data.endDate : new Date(data.endDate)
      }

      const updatedGoal = await prisma.studyGoal.update({
        where: { goalId },
        data: updateData,
      })

      // 연관된 경로 재검증
      if (existingGoal.clubId) {
        revalidatePath(`/community/${existingGoal.clubId}`)
      }

      return updatedGoal
    },
    { errorMessage: '목표 수정에 실패했습니다' }
  )
}

/**
 * Server Action: 목표 삭제 (소프트 삭제)
 */
export async function deleteGoalAction(goalId: string): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      // 목표 존재 및 소유자 확인
      const existingGoal = await prisma.studyGoal.findFirst({
        where: { goalId, deletedAt: null },
        select: { ownerId: true, clubId: true },
      })

      assertExists(existingGoal, '목표를 찾을 수 없습니다')

      if (existingGoal.ownerId !== userId) {
        throw new Error('목표 소유자만 삭제할 수 있습니다')
      }

      // 소프트 삭제
      await prisma.studyGoal.update({
        where: { goalId, deletedAt: null },
        data: { deletedAt: new Date() },
      })

      // 연관된 경로 재검증
      if (existingGoal.clubId) {
        revalidatePath(`/community/${existingGoal.clubId}`)
      }
    },
    { errorMessage: '목표 삭제에 실패했습니다' }
  )
}
