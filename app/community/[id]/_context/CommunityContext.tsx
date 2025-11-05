'use client'

import { createContext, useContext, type ReactNode } from 'react'

/**
 * 커뮤니티 컨텍스트 타입
 * - 서버에서 확인된 권한 정보를 하위 컴포넌트에 전달
 */
interface CommunityContextValue {
  /** 커뮤니티 ID */
  clubId: string
  /** 팀장 권한 여부 */
  isAdmin: boolean
  /** 멤버 여부 */
  isMember: boolean
}

const CommunityContext = createContext<CommunityContextValue | null>(null)

interface CommunityProviderProps {
  clubId: string
  isAdmin: boolean
  isMember: boolean
  children: ReactNode
}

/**
 * 커뮤니티 컨텍스트 프로바이더
 * - Next.js 15의 Server Components에서 확인된 권한 정보를 Client Components에 전달
 * - Zustand보다 가벼운 Context API 사용 (상태 변경 없음)
 */
export function CommunityProvider({ clubId, isAdmin, isMember, children }: CommunityProviderProps) {
  return (
    <CommunityContext.Provider value={{ clubId, isAdmin, isMember }}>
      {children}
    </CommunityContext.Provider>
  )
}

/**
 * 커뮤니티 컨텍스트를 사용하는 커스텀 훅
 * @throws {Error} CommunityProvider 외부에서 사용 시
 */
export function useCommunityContext() {
  const context = useContext(CommunityContext)

  if (!context) {
    throw new Error('useCommunityContext must be used within CommunityProvider')
  }

  return context
}
