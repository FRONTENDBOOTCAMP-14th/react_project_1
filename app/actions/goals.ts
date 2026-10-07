'use server'

import { MESSAGES, REVALIDATE_PATHS } from '@/constants'
import { getCurrentUserId } from '@/lib/auth'
import { canManageGoal, validateGoalCreation, validateGoalUpdate } from '@/lib/goals/goals.core'
import { createGoal, findGoalById, softDeleteGoal, updateGoal } from '@/lib/goals/goals.server'
import type { CreateGoalInput, UpdateGoalInput } from '@/lib/types/goal'
import {
  assertExists,
  ServerActionError,
  type ServerActionResponse,
  withServerAction,
} from '@/lib/utils/serverActions'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: 목표 생성
 */
export async function createGoalAction(
  data: Partial<CreateGoalInput>
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      // 입력값 검증
      const validation = validateGoalCreation(data, userId)
      if (validation.isErr()) {
        throw new ServerActionError(validation.error.message)
      }

      // 목표 생성
      const newGoal = await createGoal(validation.value)

      // 연관된 경로 재검증
      if (validation.value.clubId) {
        revalidatePath(REVALIDATE_PATHS.COMMUNITY(validation.value.clubId))
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
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      // 목표 존재 확인
      const existingGoal = await findGoalById(goalId)
      assertExists(existingGoal, '목표를 찾을 수 없습니다')

      // 소유자 권한 확인
      if (!canManageGoal(existingGoal.ownerId, userId)) {
        throw new ServerActionError('목표 소유자만 수정할 수 있습니다', 'FORBIDDEN', 403)
      }

      // 수정 내용 검증
      const validation = validateGoalUpdate(data, {
        startDate: existingGoal.startDate ? new Date(existingGoal.startDate) : null,
        endDate: existingGoal.endDate ? new Date(existingGoal.endDate) : null,
      })
      if (validation.isErr()) {
        throw new ServerActionError(validation.error.message)
      }

      // 목표 수정
      const updatedGoal = await updateGoal(goalId, validation.value)

      // 연관된 경로 재검증
      if (existingGoal.clubId) {
        revalidatePath(REVALIDATE_PATHS.COMMUNITY(existingGoal.clubId))
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
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      // 목표 존재 확인
      const existingGoal = await findGoalById(goalId)
      assertExists(existingGoal, '목표를 찾을 수 없습니다')

      // 소유자 권한 확인
      if (!canManageGoal(existingGoal.ownerId, userId)) {
        throw new ServerActionError('목표 소유자만 삭제할 수 있습니다', 'FORBIDDEN', 403)
      }

      // 목표 삭제
      await softDeleteGoal(goalId)

      // 연관된 경로 재검증
      if (existingGoal.clubId) {
        revalidatePath(REVALIDATE_PATHS.COMMUNITY(existingGoal.clubId))
      }
    },
    { errorMessage: '목표 삭제에 실패했습니다' }
  )
}
