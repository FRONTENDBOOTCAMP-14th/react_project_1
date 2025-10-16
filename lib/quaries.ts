/**
 * Prisma 공통 쿼리 정의
 */

import type { Prisma } from '@prisma/client'

/**
 * StudyGoal 기본 Select (목록 조회용)
 */
export const goalSelect = {
  goalId: true,
  ownerId: true,
  clubId: true,
  roundId: true,
  title: true,
  description: true,
  isTeam: true,
  isComplete: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.StudyGoalSelect

/**
 * StudyGoal 상세 Select (관계 포함)
 */
export const goalDetailSelect = {
  ...goalSelect,
  owner: {
    select: {
      userId: true,
      username: true,
      email: true,
    },
  },
  club: {
    select: {
      clubId: true,
      name: true,
    },
  },
  round: {
    select: {
      roundId: true,
      roundNumber: true,
      createdAt: true,
    },
  },
} satisfies Prisma.StudyGoalSelect

/**
 * 활성 목표 조건 (소프트 삭제 제외)
 */
export const activeGoalWhere = {
  deletedAt: null,
} satisfies Prisma.StudyGoalWhereInput
