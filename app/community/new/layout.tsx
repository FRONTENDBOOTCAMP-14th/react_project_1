import type { ReactNode } from 'react'
import styles from './layout.module.css'

/**
 * 커뮤니티 생성 페이지 레이아웃
 * - 루트 layout.tsx의 자식으로 작동
 */
export default function CommunityNewLayout({ children }: { children: ReactNode }) {
  return <div className={styles['main-wrapper']}>{children}</div>
}
