'use client'

import { cn } from '@/lib/utils'
import styles from './ParticipateRate.module.css'

export interface ParticipateRateProps {
  /** 참여율 레이블 */
  name?: string
  /** 현재 참여율 값 */
  value: number
  /** 최대값 (기본값: 100) */
  max?: number
  /** 추가 CSS 클래스명 */
  className?: string
}

/**
 * 참여율을 시각적으로 표시하는 프로그레스 바 컴포넌트
 *
 * @param props - 참여율 컴포넌트 props
 * @param props.name - 레이블 텍스트
 * @param props.value - 현재 값
 * @param props.max - 최대값 (기본 100)
 * @param props.className - 추가 클래스명
 *
 * @returns 참여율 프로그레스 바
 *
 * @example
 * ```tsx
 * <ParticipateRate name="지난 참여율" value={75} max={100} />
 * ```
 */
const ParticipateRate = ({ name, value, max = 100, className }: ParticipateRateProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn(styles.container, className)}>
      {name && <span className={styles.label}>{name}</span>}
      <div
        className={styles['progress-bar']}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className={styles['progress-fill']} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export default ParticipateRate
