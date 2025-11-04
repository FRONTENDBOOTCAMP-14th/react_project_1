'use client'

import { memo, type ReactNode } from 'react'
import styles from './CommunityContent.module.css'

interface CommunityLayoutProps {
  /** 커뮤니티 ID */
  clubId: string
  /** 자식 컴포넌트들 */
  children: ReactNode
  /** 추가적인 CSS 클래스명 */
  className?: string
}

/**
 * 커뮤니티 페이지 레이아웃 컴포넌트
 * 일관된 레이아웃 구조를 제공하고 스타일을 중앙 관리합니다.
 */
function CommunityLayout({ clubId, children, className }: CommunityLayoutProps) {
  return (
    <div className={`${styles['content-wrapper']} ${className || ''}`} data-community-id={clubId}>
      {children}
    </div>
  )
}

export default memo(CommunityLayout)
