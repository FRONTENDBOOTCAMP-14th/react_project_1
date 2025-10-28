/**
 * 미들웨어 관련 타입 정의
 */

/**
 * 라우트 접근 권한 레벨
 */
export enum AccessLevel {
  PUBLIC = 'public',
  AUTHENTICATED = 'authenticated',
  MEMBER = 'member',
  ADMIN = 'admin',
  OWNER = 'owner',
}

/**
 * 라우트 설정
 */
export interface RouteConfig {
  /** 라우트 패턴 */
  pattern: string
  /** 필요한 접근 권한 레벨 */
  accessLevel: AccessLevel
  /** 리다이렉트 경로 (권한 없을 때) */
  redirectTo?: string
  /** 라우트 설명 */
  description?: string
}

/**
 * 미들웨어 컨텍스트
 */
export interface MiddlewareContext {
  /** 요청 경로 */
  pathname: string
  /** 사용자 ID (인증된 경우) */
  userId?: string
  /** JWT 토큰 */
  token?: string
  /** 요청 시간 */
  timestamp: number
}

/**
 * API 인증 결과
 */
export interface AuthResult {
  /** 인증 성공 여부 */
  authenticated: boolean
  /** 사용자 ID */
  userId?: string
  /** 에러 메시지 */
  error?: string
  /** HTTP 상태 코드 */
  statusCode?: number
}

/**
 * 권한 검증 옵션
 */
export interface PermissionCheckOptions {
  /** 커뮤니티 ID */
  clubId?: string
  /** 팀장 권한 필요 여부 */
  requireLeader?: boolean
  /** 멤버 권한 필요 여부 */
  requireMember?: boolean
  /** 관리자 권한 필요 여부 */
  requireAdmin?: boolean
}

/**
 * 보호된 라우트 설정
 */
export interface ProtectedRouteConfig {
  /** API 경로 */
  apiRoutes: string[]
  /** 페이지 경로 */
  pageRoutes: string[]
  /** 공개 경로 */
  publicRoutes: string[]
}
