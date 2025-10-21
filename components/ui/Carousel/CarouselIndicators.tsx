import { cn } from '@/lib/utils'
import styles from './CarouselIndicators.module.css'

interface CarouselIndicatorsProps {
  itemCount: number
  currentIndex: number
  onIndicatorClick: (index: number) => void
}

/**
 * 캐러셀 인디케이터 컴포넌트
 */
const CarouselIndicators = ({
  itemCount,
  currentIndex,
  onIndicatorClick,
}: CarouselIndicatorsProps) => {
  if (itemCount <= 1) return null

  return (
    <div className={styles.indicators} role="tablist" aria-label="슬라이드 인디케이터">
      {Array.from({ length: itemCount }).map((_, index) => (
        <button
          key={index}
          className={cn(styles.indicator, currentIndex === index && styles['indicator-active'])}
          onClick={() => onIndicatorClick(index)}
          aria-label={`슬라이드 ${index + 1}로 이동`}
          aria-selected={currentIndex === index}
          role="tab"
        />
      ))}
    </div>
  )
}

export default CarouselIndicators
