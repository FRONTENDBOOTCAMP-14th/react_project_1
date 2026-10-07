'use server'

import { MESSAGES, PERMISSION_LEVELS, REVALIDATE_PATHS } from '@/constants'
import { getCurrentUserId } from '@/lib/auth'
import { validateRoundCreation, validateRoundUpdate } from '@/lib/rounds/rounds.core'
import {
  createRound,
  findRoundById,
  softDeleteRound,
  updateRound,
} from '@/lib/rounds/rounds.server'
import type { CreateRoundRequest } from '@/lib/types/round'
import {
  assertExists,
  checkPermission,
  ServerActionError,
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

      // Core: 입력 검증
      const validation = validateRoundCreation(data)
      if (validation.isErr()) {
        throw new ServerActionError(validation.error.message)
      }

      // Server I/O: 라운드 생성
      const round = await createRound(validation.value)

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

      // Server I/O: 라운드 존재 및 모임 소속 확인
      const existingRound = await findRoundById(roundId, clubId)
      assertExists(existingRound, MESSAGES.ERROR.ROUND_NOT_FOUND)

      // Core: 입력 검증 (기존 시작/종료 일시와 결합하여 불변식 검증)
      const validation = validateRoundUpdate(data, {
        startDate: existingRound.startDate,
        endDate: existingRound.endDate,
      })
      if (validation.isErr()) {
        throw new ServerActionError(validation.error.message)
      }

      // Server I/O: 라운드 업데이트
      const round = await updateRound(roundId, validation.value)

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

      // Server I/O: 라운드 존재 및 모임 소속 확인
      const existingRound = await findRoundById(roundId, clubId)
      assertExists(existingRound, MESSAGES.ERROR.ROUND_NOT_FOUND)

      // Server I/O: 라운드 소프트 삭제
      await softDeleteRound(roundId)

      revalidatePath(REVALIDATE_PATHS.COMMUNITY(clubId))
    },
    { errorMessage: MESSAGES.ERROR.ROUND_DELETE_FAILED }
  )
}
