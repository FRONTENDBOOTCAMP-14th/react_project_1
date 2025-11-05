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
    MEMBERS: (clubId: string) => `/community/member/${clubId}`,
  },
  NOTIFICATIONS: '/notifications',
  LOGIN: '/login',
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
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    BY_ID: (notificationId: string) => `/api/notifications/${notificationId}`,
    WITH_PARAMS: (params: {
      clubId: string
      isPinned?: boolean
      page?: number
      limit?: number
    }) => {
      const searchParams = new URLSearchParams()
      searchParams.append('clubId', params.clubId)
      if (params.isPinned !== undefined) searchParams.append('isPinned', String(params.isPinned))
      if (params.page) searchParams.append('page', String(params.page))
      if (params.limit) searchParams.append('limit', String(params.limit))
      return `/api/notifications?${searchParams.toString()}`
    },
  },
  MEMBERS: {
    BASE: '/api/members',
    BY_ID: (memberId: string) => `/api/members/${memberId}`,
    WITH_PARAMS: (params: {
      clubId?: string
      userId?: string
      role?: string
      page?: number
      limit?: number
    }) => {
      const searchParams = new URLSearchParams()
      if (params.clubId) searchParams.append('clubId', params.clubId)
      if (params.userId) searchParams.append('userId', params.userId)
      if (params.role) searchParams.append('role', params.role)
      if (params.page) searchParams.append('page', String(params.page))
      if (params.limit) searchParams.append('limit', String(params.limit))
      return `/api/members?${searchParams.toString()}`
    },
  },
  USER: {
    COMMUNITIES: '/api/user/communities',
  },
  REGION: {
    BASE: '/api/region',
  },
  SEARCH: {
    BASE: '/api/search',
    WITH_PARAMS: (params: { q?: string; region?: string }) => {
      const searchParams = new URLSearchParams()
      if (params.q) searchParams.append('q', params.q)
      if (params.region) searchParams.append('region', params.region)
      return `/api/search?${searchParams.toString()}`
    },
  },
  ATTENDANCE: {
    BASE: '/api/attendance',
    BY_ID: (id: string) => `/api/attendance/${id}`,
    BY_ROUND: (roundId: string) => `/api/attendance/round/${roundId}`,
    BY_USER: (userId: string) => `/api/attendance/user/${userId}`,
  },
} as const

/**
 * Revalidate 경로 상수
 */
export const REVALIDATE_PATHS = {
  COMMUNITY: (clubId: string) => `/community/${clubId}`,
  COMMUNITY_ROUNDS: (clubId: string) => `/community/${clubId}/rounds`,
  COMMUNITY_GOALS: (clubId: string) => `/community/${clubId}/goals`,
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
} as const

/**
 * Revalidate 태그 상수
 */
export const REVALIDATE_TAGS = {
  COMMUNITIES: 'communities',
  ROUNDS: 'rounds',
  GOALS: 'goals',
  MEMBERS: 'members',
  PROFILE: 'profile',
} as const

/**
 * 권한 레벨 상수
 */
export const PERMISSION_LEVELS = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const

/**
 * 출석 타입 상수
 */
export const ATTENDANCE_TYPES = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
} as const

/**
 * 목표 상태 상수
 */
export const GOAL_STATUS = {
  ACTIVE: false,
  COMPLETED: true,
} as const

/**
 * HTTP 헤더 상수
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: {
    'Content-Type': 'application/json',
  },
} as const
