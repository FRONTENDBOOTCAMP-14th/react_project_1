import { err, ok, type Result } from '@/lib/errors/result'
import type { CreateReactionRequest, UpdateReactionRequest } from '@/lib/types/reaction'

export interface ValidatedReactionCreationData {
  userId: string
  memberId: string
  reaction: string
}

export interface ValidatedReactionUpdateData {
  reaction: string
}

/**
 * 리액션 생성 입력값 검증 및 정제
 */
export function validateReactionCreation(
  data: Partial<CreateReactionRequest>,
  userId: string
): Result<ValidatedReactionCreationData, Error> {
  const memberId = data.memberId?.trim()
  if (!memberId || memberId.length === 0) {
    return err(new Error('memberId는 필수입니다'))
  }

  const reaction = data.reaction?.trim()
  if (!reaction || reaction.length === 0) {
    return err(new Error('리액션 내용을 입력해주세요'))
  }
  if (reaction.length > 50) {
    return err(new Error('리액션 내용은 50자 이하여야 합니다'))
  }

  return ok({
    userId,
    memberId,
    reaction,
  })
}

/**
 * 리액션 수정 입력값 검증 및 정제
 */
export function validateReactionUpdate(
  data: UpdateReactionRequest
): Result<ValidatedReactionUpdateData, Error> {
  const reaction = data.reaction?.trim()
  if (!reaction || reaction.length === 0) {
    return err(new Error('리액션 내용을 입력해주세요'))
  }
  if (reaction.length > 50) {
    return err(new Error('리액션 내용은 50자 이하여야 합니다'))
  }

  return ok({
    reaction,
  })
}

/**
 * 리액션 관리 권한 확인
 * - 작성자 본인만 수정/삭제 가능
 */
export function canManageReaction(reactionUserId: string, currentUserId: string): boolean {
  return reactionUserId === currentUserId
}
