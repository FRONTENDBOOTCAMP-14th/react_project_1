import prisma from '@/lib/prisma'
import { activeGoalWhere, goalDetailSelect, goalSelect } from '@/lib/queries'
import type { Prisma } from '@prisma/client'
import type { ValidatedGoalCreationData, ValidatedGoalUpdateData } from './goals.core'

export interface GoalFilterOptions {
  clubId?: string | null
  roundId?: string | null
  isTeam?: boolean
  isComplete?: boolean
  ownerId?: string | null
}

/**
 * 목표 필터링 where 절 생성
 */
export function buildGoalWhereClause(filters: GoalFilterOptions = {}): Prisma.StudyGoalWhereInput {
  const whereClause: Prisma.StudyGoalWhereInput = {
    ...activeGoalWhere,
  }

  if (filters.clubId) {
    whereClause.clubId = filters.clubId
  }
  if (filters.roundId) {
    whereClause.roundId = filters.roundId
  }
  if (filters.isTeam !== undefined) {
    whereClause.isTeam = filters.isTeam
  }
  if (filters.isComplete !== undefined) {
    whereClause.isComplete = filters.isComplete
  }
  if (filters.ownerId) {
    whereClause.ownerId = filters.ownerId
  }

  return whereClause
}

/**
 * 활성 목표 단건 조회
 */
export async function findGoalById(goalId: string, includeRelations = false) {
  return prisma.studyGoal.findFirst({
    where: {
      goalId,
      deletedAt: null,
    },
    select: includeRelations ? goalDetailSelect : goalSelect,
  })
}

/**
 * 목표 생성
 */
export async function createGoal(data: ValidatedGoalCreationData) {
  return prisma.studyGoal.create({
    data: {
      ownerId: data.ownerId,
      clubId: data.clubId,
      roundId: data.roundId,
      title: data.title,
      description: data.description,
      isTeam: data.isTeam,
      isComplete: data.isComplete,
      startDate: data.startDate,
      endDate: data.endDate,
    },
    select: goalSelect,
  })
}

/**
 * 목표 수정
 */
export async function updateGoal(goalId: string, data: ValidatedGoalUpdateData) {
  return prisma.studyGoal.update({
    where: { goalId, deletedAt: null },
    data,
    select: goalSelect,
  })
}

/**
 * 목표 소프트 삭제
 */
export async function softDeleteGoal(goalId: string) {
  return prisma.studyGoal.update({
    where: { goalId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}
