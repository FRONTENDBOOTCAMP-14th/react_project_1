'use client'

import { useEffect, useState, useTransition } from 'react'
import type { ReactNode } from 'react'
import styles from './Carousel.module.css'
import './animations.css'
import { cn } from '@/lib/utils'
import { useCarouselScroll } from './useCarouselScroll'
import { useCarouselAutoPlay } from './useCarouselAutoPlay'
import CarouselNavigation from './CarouselNavigation'
import CarouselIndicators from './CarouselIndicators'

export type CarouselEffect = 'slide' | 'fade' | 'coverflow' | 'flip' | 'scale' | 'parallax' | 'cube'

export interface CarouselProps {
  /** 캐러셀 아이템 배열 */
  children: ReactNode
  /** 한 번에 보여줄 아이템 개수 (기본값: 자동) */
  itemsPerView?: number | 'auto'
  /** 아이템 간 간격 (px, 기본값: 16) */
  gap?: number
  /** 자동 재생 여부 (기본값: false) */
  autoPlay?: boolean
  /** 자동 재생 간격 (ms, 기본값: 3000) */
  autoPlayInterval?: number
  /** 무한 루프 여부 (기본값: false) */
  loop?: boolean
  /** 마우스 호버 시 자동재생 일시정지 (기본값: true) */
  pauseOnHover?: boolean
  /** 터치 스와이프 임계값 (px, 기본값: 50) */
  swipeThreshold?: number
  /** 내비게이션 버튼 표시 여부 (기본값: true) */
  showNavigation?: boolean
  /** 인디케이터 표시 여부 (기본값: true) */
  showIndicators?: boolean
  /** 터치/제스처 지원 여부 (기본값: true) */
  enableTouch?: boolean
  /** 애니메이션 효과 (기본값: 'slide') */
  effect?: CarouselEffect
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * Carousel 컴포넌트
 *
 * @example
 * ```tsx
 * <Carousel gap={16} showNavigation showIndicators>
 *   <CarouselItem>아이템 1</CarouselItem>
 *   <CarouselItem>아이템 2</CarouselItem>
 *   <CarouselItem>아이템 3</CarouselItem>
 * </Carousel>
 * ```
 */
const Carousel = ({
  children,
  itemsPerView = 'auto',
  gap = 16,
  autoPlay = false,
  autoPlayInterval = 3000,
  loop = false,
  pauseOnHover = true,
  swipeThreshold = 50,
  showNavigation = true,
  showIndicators = true,
  enableTouch = true,
  effect = 'slide',
  className,
}: CarouselProps) => {
  const [itemCount, setItemCount] = useState(0)
  const [_isPending, startTransition] = useTransition() // 나중에 로딩 UI에 활용 가능

  const { containerRef, currentIndex, canScrollLeft, canScrollRight, scrollTo, scrollToIndex } =
    useCarouselScroll({
      itemCount,
      itemsPerView,
      enableTouch,
      swipeThreshold,
    })

  // 자동재생 및 무한 루프
  const { handleMouseEnter, handleMouseLeave } = useCarouselAutoPlay({
    autoPlay,
    autoPlayInterval,
    loop,
    itemCount,
    canScrollRight,
    scrollTo,
    scrollToIndex,
    pauseOnHover,
  })

  // useTransition을 활용한 인디케이터 클릭 최적화
  const handleIndicatorClick = (index: number) => {
    startTransition(() => {
      scrollToIndex(index)
    })
  }

  // 아이템 개수 계산 (children에서 직접 계산)
  useEffect(() => {
    const count = Array.isArray(children) ? children.length : 1
    setItemCount(count)
  }, [children])

  return (
    <div
      className={cn(styles.wrapper, `carousel-effect-${effect}`, className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 내비게이션 버튼 */}
      {showNavigation && (
        <CarouselNavigation
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          onScrollLeft={() => scrollTo('left')}
          onScrollRight={() => scrollTo('right')}
        />
      )}

      {/* 캐러셀 컨테이너 */}
      <div
        ref={containerRef}
        className={styles.container}
        style={{
          gap: `${gap}px`,
          gridAutoColumns:
            itemsPerView === 'auto'
              ? 'auto'
              : `calc((100% - ${gap * (itemsPerView - 1)}px) / ${itemsPerView})`,
        }}
        role="region"
        aria-label="캐러셀"
        aria-live={autoPlay ? 'polite' : 'off'}
        aria-atomic="false"
      >
        {children}
      </div>

      {/* 인디케이터 */}
      {showIndicators && (
        <CarouselIndicators
          itemCount={itemCount}
          currentIndex={currentIndex}
          itemsPerView={itemsPerView}
          onIndicatorClick={handleIndicatorClick}
        />
      )}
    </div>
  )
}

export default Carousel
