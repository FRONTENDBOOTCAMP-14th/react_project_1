/**
 * 애플리케이션 라우트 및 API 엔드포인트 상수
 * URL 하드코딩 방지 및 중앙 집중식 관리
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

/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
  GOALS: {
    BASE: '/api/goals',
    BY_ID: (goalId: string) => `/api/goals/${goalId}`,
    WITH_PARAMS: (params: { clubId?: string; isTeam?: boolean; roundId?: string }) => {
      const searchParams = new URLSearchParams()
      if (params.clubId) searchParams.append('clubId', params.clubId)
      if (params.isTeam !== undefined) searchParams.append('isTeam', String(params.isTeam))
      if (params.roundId) searchParams.append('roundId', params.roundId)
      return `/api/goals?${searchParams.toString()}`
    },
  },
  COMMUNITIES: {
    BASE: '/api/communities',
    BY_ID: (clubId: string) => `/api/communities/${clubId}`,
    DELETE_BY_ID: (clubId: string) => `/api/communities?id=${clubId}`,
  },
  ROUNDS: {
    BASE: '/api/rounds',
    BY_ID: (roundId: string) => `/api/rounds/${roundId}`,
    WITH_PARAMS: (params: { clubId?: string }) => {
      const searchParams = new URLSearchParams()
      if (params.clubId) searchParams.append('clubId', params.clubId)
      return `/api/rounds?${searchParams.toString()}`
    },
  },
} as const

/**
 * HTTP 헤더 상수
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: {
    'Content-Type': 'application/json',
  },
} as const
