import { useEffect, useRef, useState } from 'react'

interface UseCarouselAutoPlayProps {
  autoPlay: boolean
  autoPlayInterval: number
  loop: boolean
  itemCount: number
  canScrollRight: boolean
  scrollTo: (direction: 'left' | 'right') => void
  scrollToIndex: (index: number) => void
  pauseOnHover?: boolean
}

interface UseCarouselAutoPlayReturn {
  isPaused: boolean
  handleMouseEnter: () => void
  handleMouseLeave: () => void
  pauseAutoPlay: () => void
}

/**
 * 캐러셀 자동재생 로직을 관리하는 커스텀 훅
 * 무한 루프 옵션 지원
 */
export function useCarouselAutoPlay({
  autoPlay,
  autoPlayInterval,
  loop,
  itemCount,
  canScrollRight,
  scrollTo,
  scrollToIndex,
  pauseOnHover = true,
}: UseCarouselAutoPlayProps): UseCarouselAutoPlayReturn {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  // 마우스 이벤트 핸들러
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true)
    }
  }

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false)
    }
  }

  useEffect(() => {
    if (!autoPlay || isPaused || itemCount === 0) return

    intervalRef.current = setInterval(() => {
      if (canScrollRight) {
        // 다음 슬라이드로 이동
        scrollTo('right')
      } else if (loop) {
        // 루프 활성화 시 처음으로 돌아감
        scrollToIndex(0)
      } else {
        // 루프 비활성화 시 자동재생 중지
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }, autoPlayInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [
    autoPlay,
    autoPlayInterval,
    loop,
    itemCount,
    canScrollRight,
    scrollTo,
    scrollToIndex,
    isPaused,
  ])

  // 수동으로 자동재생 일시 정지
  const pauseAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  return { isPaused, handleMouseEnter, handleMouseLeave, pauseAutoPlay }
}
