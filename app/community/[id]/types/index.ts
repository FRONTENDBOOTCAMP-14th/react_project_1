/**
 * Community/[id] 페이지에서 사용하는 타입 정의
 */

import type { Round } from '@/lib/types/round'

/**
 * 라운드 카드 props 타입
 */
export interface RoundCardProps {
  /** 표시할 라운드 정보 */
  round: Round | null
  /** 라운드 카드가 열려있는지 여부 */
  isOpen: boolean
  /** 라운드 카드 열림/닫힘 토글 핸들러 */
  onToggleOpen: () => void
  /** 라운드 데이터 재조회 함수 */
  onRefetch?: () => Promise<void>
}

/**
 * 라운드 카드 헤더 props 타입
 */
export interface RoundCardHeaderProps {
  /** 라운드 정보 */
  round: Round | null
  /** 라운드 카드가 열려있는지 여부 */
  isOpen: boolean
  /** 라운드 카드 열림/닫힘 토글 핸들러 */
  onToggleOpen: () => void
  /** 라운드 삭제 핸들러 */
  onDelete?: () => void
  /** 라운드 데이터 재조회 함수 */
  onRefetch?: () => Promise<void>
}

/**
 * 라운드 카드 액션 props 타입
 */
export interface RoundCardActionsProps {
  /** 라운드 삭제 핸들러 */
  onDelete: () => void
  /** 라운드 편집 모드 토글 핸들러 */
  onToggleEdit: () => void
}

/**
 * 커뮤니티 프로바이더 props 타입
 */
export interface CommunityProviderProps {
  /** 커뮤니티 식별자 */
  clubId: string
  /** 팀장 권한 여부 (서버에서 확인됨) */
  isAdmin: boolean
  /** 멤버 여부 (서버에서 확인됨) */
  isMember: boolean
  /** 자식 컴포넌트들 */
  children: React.ReactNode
}

/**
 * 커뮤니티 콘텐츠 props 타입
 */
export interface CommunityContentProps {
  /** 커뮤니티 식별자 */
  clubId: string
  /** 팀장 권한 여부 (서버에서 확인됨) */
  isAdmin: boolean
  /** 멤버 여부 (서버에서 확인됨) */
  isMember: boolean
  /** 커뮤니티 상세 정보 (서버에서 페칭됨) */
  community: import('@/lib/community/communityServer').CommunityDetail
}
