'use client'

import type { ReactNode } from 'react'
import styles from './CommunityContent.module.css'

interface CommunityLayoutProps {
  clubId: string
  children: ReactNode
  className?: string
}

/**
 * 커뮤니티 페이지 레이아웃 컴포넌트
 * - 일관된 레이아웃 구조 제공
 */
export default function CommunityLayout({ clubId, children, className }: CommunityLayoutProps) {
  return (
    <div className={`${styles['content-wrapper']} ${className || ''}`} data-community-id={clubId}>
      {children}
    </div>
  )
}
