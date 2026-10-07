'use server'

import { MESSAGES, REVALIDATE_PATHS } from '@/constants'
import { getCurrentUserId } from '@/lib/auth'
import { findMemberById } from '@/lib/community/members.server'
import {
  canManageReaction,
  validateReactionCreation,
  validateReactionUpdate,
} from '@/lib/reactions/reactions.core'
import {
  createReaction,
  findReactionById,
  softDeleteReaction,
  updateReaction,
} from '@/lib/reactions/reactions.server'
import type { CreateReactionRequest, UpdateReactionRequest } from '@/lib/types/reaction'
import {
  assertExists,
  ServerActionError,
  type ServerActionResponse,
  withServerAction,
} from '@/lib/utils/serverActions'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: 리액션 생성
 */
export async function createReactionAction(
  data: Partial<CreateReactionRequest>
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      const memberId = data.memberId
      assertExists(memberId, 'memberId는 필수입니다')

      // 대상 멤버 존재 확인
      const member = await findMemberById(memberId)
      assertExists(member, '멤버를 찾을 수 없습니다')

      // 입력값 검증
      const validation = validateReactionCreation(data, userId)
      if (validation.isErr()) {
        throw new ServerActionError(validation.error.message)
      }

      // 리액션 생성
      const reaction = await createReaction(validation.value)

      if (member.clubId) {
        revalidatePath(REVALIDATE_PATHS.COMMUNITY(member.clubId))
      }

      return reaction
    },
    { errorMessage: MESSAGES.ERROR.FAILED_TO_CREATE_REACTION }
  )
}

/**
 * Server Action: 리액션 수정
 */
export async function updateReactionAction(
  reactionId: string,
  data: UpdateReactionRequest
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      // 리액션 존재 확인
      const existing = await findReactionById(reactionId, true)
      assertExists(existing, '리액션을 찾을 수 없습니다')

      // 작성자 권한 확인
      if (!canManageReaction(existing.userId, userId)) {
        throw new ServerActionError('본인의 리액션만 수정/삭제할 수 있습니다', 'FORBIDDEN', 403)
      }

      // 수정 내용 검증
      const validation = validateReactionUpdate(data)
      if (validation.isErr()) {
        throw new ServerActionError(validation.error.message)
      }

      // 리액션 수정
      const updated = await updateReaction(reactionId, validation.value)

      return updated
    },
    { errorMessage: '리액션 수정에 실패했습니다' }
  )
}

/**
 * Server Action: 리액션 삭제
 */
export async function deleteReactionAction(reactionId: string): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      // 리액션 존재 확인
      const existing = await findReactionById(reactionId)
      assertExists(existing, '리액션을 찾을 수 없습니다')

      // 작성자 권한 확인
      if (!canManageReaction(existing.userId, userId)) {
        throw new ServerActionError('본인의 리액션만 수정/삭제할 수 있습니다', 'FORBIDDEN', 403)
      }

      // 리액션 삭제
      await softDeleteReaction(reactionId)
    },
    { errorMessage: '리액션 삭제에 실패했습니다' }
  )
}
