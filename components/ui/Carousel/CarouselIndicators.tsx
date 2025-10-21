import { cn } from '@/lib/utils'
import styles from './CarouselIndicators.module.css'

interface CarouselIndicatorsProps {
  itemCount: number
  currentIndex: number
  itemsPerView: number | 'auto'
  onIndicatorClick: (index: number) => void
}

/**
 * 캐러셀 인디케이터 컴포넌트
 * itemsPerView를 고려하여 섹션(페이지) 단위로 인디케이터 표시
 */
const CarouselIndicators = ({
  itemCount,
  currentIndex,
  itemsPerView,
  onIndicatorClick,
}: CarouselIndicatorsProps) => {
  if (itemCount <= 1) return null

  // itemsPerView가 'auto'이거나 1 이하면 전체 아이템 수 사용
  const effectiveItemsPerView =
    typeof itemsPerView === 'number' && itemsPerView > 1 ? itemsPerView : 1

  // 섹션(페이지) 수 계산
  const pageCount = Math.ceil(itemCount / effectiveItemsPerView)

  // 현재 페이지 계산
  const currentPage = Math.floor(currentIndex / effectiveItemsPerView)

  // 섹션이 1개면 인디케이터 숨김
  if (pageCount <= 1) return null

  return (
    <div className={styles.indicators} role="tablist" aria-label="슬라이드 인디케이터">
      {Array.from({ length: pageCount }).map((_, pageIndex) => {
        // 각 페이지의 첫 번째 아이템 인덱스
        const itemIndex = pageIndex * effectiveItemsPerView

        return (
          <button
            key={pageIndex}
            className={cn(
              styles.indicator,
              currentPage === pageIndex && styles['indicator-active']
            )}
            onClick={() => onIndicatorClick(itemIndex)}
            aria-label={`섹션 ${pageIndex + 1}로 이동`}
            aria-selected={currentPage === pageIndex}
            role="tab"
          />
        )
      })}
    </div>
  )
}

export default CarouselIndicators
