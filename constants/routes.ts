/**
 * 애플리케이션 라우트 상수
 * URL 하드코딩 방지 및 중앙 집중식 라우트 관리
 */

export const ROUTES = {
  COMMUNITY: {
    LIST: '/community',
    DETAIL: (clubId: string) => `/community/${clubId}`,
    NOTIFICATION: (clubId: string) => `/community/notification/${clubId}`,
    ROUND: (clubId: string) => `/community/round/${clubId}`,
  },
  GOAL: {
    CREATE: '/goal/create',
    DETAIL: (goalId: string) => `/goal/${goalId}`,
  },
} as const
