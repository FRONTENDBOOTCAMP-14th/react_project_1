'use client'

import { memo, type ReactNode } from 'react'

interface CommunitySectionProps {
  /** 섹션 제목 */
  title?: string
  /** 섹션 내용 */
  children: ReactNode
  /** 추가적인 CSS 클래스명 */
  className?: string
  /** 섹션 ID (접근성용) */
  sectionId?: string
}

/**
 * 커뮤니티 페이지 섹션 컴포넌트
 * 일관된 섹션 구조와 접근성을 제공합니다.
 */
function CommunitySection({ title, children, className, sectionId }: CommunitySectionProps) {
  return (
    <section
      className={className}
      id={sectionId}
      aria-labelledby={title ? `${sectionId}-title` : undefined}
    >
      {title && (
        <h2 id={`${sectionId}-title`} className="sr-only">
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}

export default memo(CommunitySection)
