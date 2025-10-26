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

/**
 * Round 기본 Select (목록 조회용)
 */
export const roundSelect = {
  roundId: true,
  clubId: true,
  roundNumber: true,
  startDate: true,
  endDate: true,
  location: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.RoundSelect

/**
 * Round 상세 Select (관계 포함)
 */
export const roundDetailSelect = {
  ...roundSelect,
  community: {
    select: {
      clubId: true,
      name: true,
    },
  },
  studyGoals: {
    where: {
      deletedAt: null,
    },
    select: {
      goalId: true,
      title: true,
      isComplete: true,
    },
  },
} satisfies Prisma.RoundSelect

/**
 * 활성 회차 조건 (소프트 삭제 제외)
 */
export const activeRoundWhere = {
  deletedAt: null,
} satisfies Prisma.RoundWhereInput

/**
 * Notification 기본 Select (목록 조회용)
 */
export const notificationSelect = {
  notificationId: true,
  clubId: true,
  authorId: true,
  title: true,
  content: true,
  isPinned: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.NotificationSelect

/**
 * Notification 상세 Select (관계 포함)
 */
export const notificationDetailSelect = {
  ...notificationSelect,
  community: {
    select: {
      clubId: true,
      name: true,
    },
  },
  author: {
    select: {
      userId: true,
      username: true,
    },
  },
} satisfies Prisma.NotificationSelect

/**
 * 활성 공지사항 조건 (소프트 삭제 제외)
 */
export const activeNotificationWhere = {
  deletedAt: null,
} satisfies Prisma.NotificationWhereInput

/**
 * CommunityMember 기본 Select (목록 조회용)
 */
export const memberSelect = {
  id: true,
  clubId: true,
  userId: true,
  role: true,
  joinedAt: true,
} satisfies Prisma.CommunityMemberSelect

/**
 * CommunityMember 상세 Select (관계 포함)
 */
export const memberDetailSelect = {
  ...memberSelect,
  community: {
    select: {
      clubId: true,
      name: true,
      description: true,
    },
  },
  user: {
    select: {
      userId: true,
      username: true,
      email: true,
      nickname: true,
    },
  },
} satisfies Prisma.CommunityMemberSelect

/**
 * 활성 멤버 조건 (소프트 삭제 제외)
 */
export const activeMemberWhere = {
  deletedAt: null,
} satisfies Prisma.CommunityMemberWhereInput

/**
 * Community 기본 Select (목록 조회용)
 */
export const communitySelect = {
  clubId: true,
  name: true,
  description: true,
  isPublic: true,
  createdAt: true,
  updatedAt: true,
  tagname: true,
} satisfies Prisma.CommunitySelect

/**
 * Community 상세 Select (관계 포함)
 */
export const communityDetailSelect = {
  ...communitySelect,
  communityMembers: {
    where: activeMemberWhere,
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: {
        select: {
          userId: true,
          username: true,
          email: true,
          nickname: true,
        },
      },
    },
  },
  rounds: {
    where: activeRoundWhere,
    select: roundSelect,
    orderBy: {
      startDate: 'asc',
    },
  },
} satisfies Prisma.CommunitySelect

/**
 * 활성 커뮤니티 조건 (소프트 삭제 제외)
 */
export const activeCommunityWhere = {
  deletedAt: null,
} satisfies Prisma.CommunityWhereInput

/**
 * 사용자별 구독 커뮤니티 조회 조건
 */
export const userSubscribedCommunitiesWhere = (userId: string) =>
  ({
    deletedAt: null,
    communityMembers: {
      some: {
        userId,
        deletedAt: null,
      },
    },
  }) satisfies Prisma.CommunityWhereInput

/**
 * 다가오는 라운드 조회 조건 (현재 날짜 이후)
 */
export const upcomingRoundsWhere = (fromDate: Date = new Date()) =>
  ({
    deletedAt: null,
    startDate: {
      gte: fromDate,
    },
  }) satisfies Prisma.RoundWhereInput
