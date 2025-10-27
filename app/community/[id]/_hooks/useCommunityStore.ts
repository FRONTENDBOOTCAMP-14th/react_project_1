import { create } from 'zustand'

/**
 * 커뮤니티 스토어 상태 타입
 */
interface CommunityState {
  /**
   * 현재 커뮤니티 ID
   */
  clubId: string | null
  /**
   * 팀장 권한 여부
   */
  isTeamLeader: boolean
  /**
   * 멤버 여부
   */
  isMember: boolean
  /**
   * 커뮤니티 컨텍스트 초기화
   */
  initializeCommunity: (clubId: string, isTeamLeader: boolean, isMember: boolean) => void
  /**
   * 스토어 초기화
   */
  reset: () => void
}

/**
 * 커뮤니티 전역 상태 스토어
 *
 * clubId와 isTeamLeader를 전역으로 관리하여 props drilling 방지
 */
export const useCommunityStore = create<CommunityState>(set => ({
  clubId: null,
  isTeamLeader: false,
  isMember: false,
  initializeCommunity: (clubId, isTeamLeader, isMember) => set({ clubId, isTeamLeader, isMember }),
  reset: () => set({ clubId: null, isTeamLeader: false, isMember: false }),
}))
