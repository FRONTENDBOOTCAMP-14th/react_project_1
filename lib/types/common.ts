/**
 * 공통 Props 타입 정의
 * 반복되는 타입 정의를 방지하고 일관성 유지
 */

/**
 * 커뮤니티 ID를 받는 컴포넌트의 공통 Props
 */
export interface WithClubId {
  clubId: string
}

/**
 * 라운드 ID를 받는 컴포넌트의 공통 Props
 */
export interface WithRoundId {
  roundId: string
}

/**
 * 목표 ID를 받는 컴포넌트의 공통 Props
 */
export interface WithGoalId {
  goalId: string
}

/**
 * 팀장 권한을 확인하는 컴포넌트의 공통 Props
 */
export interface WithTeamLeaderPermission {
  isTeamLeader?: boolean
}

/**
 * 로딩 상태를 가진 컴포넌트의 공통 Props
 */
export interface WithLoadingState {
  loading?: boolean
}

/**
 * 에러 상태를 가진 컴포넌트의 공통 Props
 */
export interface WithErrorState {
  error?: string | null
}

/**
 * 재시도 기능을 가진 컴포넌트의 공통 Props
 */
export interface WithRetry {
  onRetry?: () => void
}

/**
 * 기본 컨테이너 Props
 */
export interface BaseContainerProps extends WithClubId, WithTeamLeaderPermission {}
