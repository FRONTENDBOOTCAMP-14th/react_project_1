'use client'

import type { ReactNode } from 'react'
import { useCommunityContext } from '../_context/CommunityContext'
import styles from './CommunityContent.module.css'

interface CommunityLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * 커뮤니티 페이지 레이아웃 컴포넌트
 * - 일관된 레이아웃 구조 제공
 */
export default function CommunityLayout({ children, className }: CommunityLayoutProps) {
  const { clubId } = useCommunityContext()
  return (
    <div className={`${styles['content-wrapper']} ${className || ''}`} data-community-id={clubId}>
      {children}
    </div>
  )
}
