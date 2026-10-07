import prisma from '@/lib/prisma'
import { activeReactionWhere, reactionDetailSelect, reactionSelect } from '@/lib/queries'
import type { Prisma } from '@prisma/client'
import type { ValidatedReactionCreationData, ValidatedReactionUpdateData } from './reactions.core'

/**
 * 리액션 필터링 where 절 생성
 */
export function buildReactionWhereClause(
  memberId?: string | null,
  userId?: string | null
): Prisma.ReactionWhereInput {
  const whereClause: Prisma.ReactionWhereInput = {
    ...activeReactionWhere,
  }

  if (memberId) {
    whereClause.member_id = memberId
  }

  if (userId) {
    whereClause.userId = userId
  }

  return whereClause
}

/**
 * 활성 리액션 단건 조회
 */
export async function findReactionById(reactionId: string, includeRelations = false) {
  return prisma.reaction.findFirst({
    where: {
      reactionId,
      deletedAt: null,
    },
    select: includeRelations ? reactionDetailSelect : reactionSelect,
  })
}

/**
 * 리액션 생성
 */
export async function createReaction(data: ValidatedReactionCreationData) {
  return prisma.reaction.create({
    data: {
      userId: data.userId,
      member_id: data.memberId,
      reaction: data.reaction,
    },
    select: reactionSelect,
  })
}

/**
 * 리액션 수정
 */
export async function updateReaction(reactionId: string, data: ValidatedReactionUpdateData) {
  return prisma.reaction.update({
    where: {
      reactionId,
      deletedAt: null,
    },
    data: {
      reaction: data.reaction,
    },
    select: reactionSelect,
  })
}

/**
 * 리액션 소프트 삭제
 */
export async function softDeleteReaction(reactionId: string) {
  return prisma.reaction.update({
    where: {
      reactionId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}
