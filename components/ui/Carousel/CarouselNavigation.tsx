import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import IconButton from '../IconButton'
import styles from './CarouselNavigation.module.css'

interface CarouselNavigationProps {
  canScrollLeft: boolean
  canScrollRight: boolean
  onScrollLeft: () => void
  onScrollRight: () => void
}

/**
 * 캐러셀 내비게이션 버튼 컴포넌트
 */
const CarouselNavigation = ({
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
}: CarouselNavigationProps) => {
  return (
    <>
      <IconButton
        className={cn(styles.nav, styles['nav-left'], !canScrollLeft && styles['nav-disabled'])}
        onClick={onScrollLeft}
        disabled={!canScrollLeft}
        aria-label="이전 슬라이드"
      >
        <ChevronLeft size={24} />
      </IconButton>
      <IconButton
        className={cn(styles.nav, styles['nav-right'], !canScrollRight && styles['nav-disabled'])}
        onClick={onScrollRight}
        disabled={!canScrollRight}
        aria-label="다음 슬라이드"
      >
        <ChevronRight size={24} />
      </IconButton>
    </>
  )
}

export default CarouselNavigation
