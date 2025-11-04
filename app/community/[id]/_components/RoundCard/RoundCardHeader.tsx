'use client'

import { memo } from 'react'
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import type { Round } from '@/lib/types/round'
import { formatDateRangeUTC } from '@/lib/utils'
import styles from './RoundCard.module.css'

interface RoundCardHeaderProps {
  /** 라운드 정보 */
  round: Round
  /** 라운드 카드가 열려있는지 여부 */
  isOpen: boolean
  /** 라운드 카드 열림/닫힘 토글 핸들러 */
  onToggleOpen: () => void
}

/**
 * 라운드 카드 헤더 컴포넌트
 * 라운드 기본 정보와 토글 버튼을 표시합니다.
 */
function RoundCardHeader({ round, isOpen, onToggleOpen }: RoundCardHeaderProps) {
  const dateRange = formatDateRangeUTC(round.startDate, round.endDate)

  return (
    <div className={styles['round-header']}>
      <div className={styles['round-info']}>
        <h3 className={styles['round-title']}>제 {round.roundNumber}회차</h3>
        <div className={styles['round-meta']}>
          <span className={styles['round-dates']}>{dateRange}</span>
          {round.location && (
            <span className={styles['round-location']}>
              <MapPin size={16} />
              {round.location}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        className={styles['toggle-button']}
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        aria-label={`라운드 ${isOpen ? '닫기' : '열기'}`}
      >
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
    </div>
  )
}

export default memo(RoundCardHeader)
