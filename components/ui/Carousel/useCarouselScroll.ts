import { useRef, useState, useEffect, useCallback } from 'react'

interface UseCarouselScrollProps {
  itemCount: number
  itemsPerView: number | 'auto'
  enableTouch?: boolean
  swipeThreshold?: number
}

interface UseCarouselScrollReturn {
  containerRef: React.RefObject<HTMLDivElement | null>
  currentIndex: number
  canScrollLeft: boolean
  canScrollRight: boolean
  scrollTo: (direction: 'left' | 'right') => void
  scrollToIndex: (index: number) => void
}

/**
 * 캐러셀 스크롤 로직을 관리하는 커스텀 훅
 * requestAnimationFrame을 활용한 성능 최적화 포함
 */
export function useCarouselScroll({
  itemCount,
  itemsPerView,
  enableTouch = true,
  swipeThreshold = 50,
}: UseCarouselScrollProps): UseCarouselScrollReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollTimeoutRef = useRef<number | null>(null)
  const touchStartXRef = useRef<number>(0)
  const touchStartYRef = useRef<number>(0)
  const touchStartTimeRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)

  // 스크롤 가능 여부 체크
  const checkScrollability = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  // 스크롤 이벤트 핸들러 (requestAnimationFrame으로 최적화)
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      window.cancelAnimationFrame(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = window.requestAnimationFrame(() => {
      checkScrollability()

      const container = containerRef.current
      if (!container || itemCount === 0) return

      const { scrollLeft, scrollWidth, clientWidth } = container
      const maxScrollLeft = scrollWidth - clientWidth

      // 끝까지 스크롤했을 때 마지막 인덱스 설정
      if (scrollLeft >= maxScrollLeft - 1) {
        setCurrentIndex(itemCount - 1)
        return
      }

      // 시작 지점일 때
      if (scrollLeft <= 1) {
        setCurrentIndex(0)
        return
      }

      // 중간 지점 계산
      const itemWidth =
        itemsPerView === 'auto'
          ? container.scrollWidth / itemCount
          : container.clientWidth / itemsPerView

      const newIndex = Math.round(scrollLeft / itemWidth)
      setCurrentIndex(Math.min(newIndex, itemCount - 1))
    })
  }, [checkScrollability, itemCount, itemsPerView])

  // 스크롤 함수
  const scrollTo = useCallback((direction: 'left' | 'right') => {
    const container = containerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.8
    const newScrollLeft =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    })
  }, [])

  // 특정 인덱스로 이동
  const scrollToIndex = useCallback(
    (index: number) => {
      const container = containerRef.current
      if (!container || itemCount === 0) return

      const itemWidth = container.scrollWidth / itemCount
      const scrollLeft = itemWidth * index

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      })
    },
    [itemCount]
  )

  // 초기 스크롤 가능 여부 체크 및 리사이즈 이벤트
  useEffect(() => {
    checkScrollability()
    window.addEventListener('resize', checkScrollability)
    return () => window.removeEventListener('resize', checkScrollability)
  }, [checkScrollability])

  // 터치 이벤트 핸들러
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
    touchStartTimeRef.current = Date.now()
    isDraggingRef.current = false
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current) {
      const touchX = e.touches[0].clientX
      const touchY = e.touches[0].clientY
      const diffX = Math.abs(touchX - touchStartXRef.current)
      const diffY = Math.abs(touchY - touchStartYRef.current)

      // 수평 스크롤인지 수직 스크롤인지 판단
      if (diffX > diffY && diffX > 10) {
        isDraggingRef.current = true
        e.preventDefault() // 수평 스크롤일 때만 기본 동작 방지
        // 드래그 중 텍스트 선택 방지
        document.body.style.userSelect = 'none'
        document.body.style.webkitUserSelect = 'none'
      }
    } else {
      // 드래그 중 계속 기본 동작 방지
      e.preventDefault()
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isDraggingRef.current) return

      const touchEndX = e.changedTouches[0].clientX
      const diff = touchStartXRef.current - touchEndX
      const duration = Date.now() - touchStartTimeRef.current
      const velocity = Math.abs(diff) / duration

      // 빠른 스와이프는 더 작은 임계값 적용 (속도 > 0.5px/ms)
      const threshold = velocity > 0.5 ? swipeThreshold * 0.6 : swipeThreshold

      if (Math.abs(diff) > threshold) {
        scrollTo(diff > 0 ? 'right' : 'left')
      }

      // 텍스트 선택 복원
      document.body.style.userSelect = ''
      document.body.style.webkitUserSelect = ''
      isDraggingRef.current = false
    },
    [scrollTo, swipeThreshold]
  )

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        window.cancelAnimationFrame(scrollTimeoutRef.current)
      }
    }
  }, [handleScroll])

  // 터치 이벤트 리스너
  useEffect(() => {
    if (!enableTouch) return

    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enableTouch, handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    containerRef,
    currentIndex,
    canScrollLeft,
    canScrollRight,
    scrollTo,
    scrollToIndex,
  }
}
