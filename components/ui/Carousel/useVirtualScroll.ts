import { useState, useEffect, useRef } from 'react'
import type { RefObject } from 'react'

interface UseVirtualScrollProps {
  itemCount: number
  containerRef: RefObject<HTMLDivElement | null>
  enabled: boolean
  itemsPerView?: number
}

interface UseVirtualScrollReturn {
  visibleRange: { start: number; end: number }
  isItemVisible: (index: number) => boolean
}

/**
 * 가상 스크롤링을 위한 커스텀 훅
 * IntersectionObserver를 활용하여 보이는 아이템만 추적
 */
export function useVirtualScroll({
  itemCount,
  containerRef,
  enabled,
  itemsPerView = 3,
}: UseVirtualScrollProps): UseVirtualScrollReturn {
  // 초기 범위를 화면에 보이는 만큼만 설정 (최소 itemsPerView + 2개는 보이도록)
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: enabled ? Math.max(itemsPerView + 2, Math.min(itemCount, itemsPerView + 2)) : itemCount,
  })
  const observerRef = useRef<IntersectionObserver | null>(null)

  // itemsPerView 변경 시 visibleRange 업데이트
  useEffect(() => {
    if (itemCount === 0) return // itemCount가 0이면 업데이트 안 함

    setVisibleRange({
      start: 0,
      end: enabled ? Math.min(itemCount, itemsPerView + 2) : itemCount,
    })
  }, [enabled, itemCount, itemsPerView])

  useEffect(() => {
    if (!enabled || !containerRef.current || itemCount === 0) {
      return
    }

    const container = containerRef.current
    const visibleIndices = new Set<number>()

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const index = Array.from(container.children).indexOf(entry.target)
          if (index === -1) return

          if (entry.isIntersecting) {
            visibleIndices.add(index)
          } else {
            visibleIndices.delete(index)
          }
        })

        if (visibleIndices.size > 0) {
          const indices = Array.from(visibleIndices).sort((a, b) => a - b)
          const start = Math.max(0, indices[0] - 2) // 버퍼 아이템 추가
          const end = Math.min(itemCount, indices[indices.length - 1] + 3) // 버퍼 아이템 추가
          setVisibleRange({ start, end })
        }
      },
      {
        root: container,
        rootMargin: '50px', // 미리 로드
        threshold: 0.1,
      }
    )

    // 모든 자식 요소 관찰
    Array.from(container.children).forEach(child => {
      observerRef.current?.observe(child)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [enabled, containerRef, itemCount])

  const isItemVisible = (index: number) => {
    if (!enabled) return true
    return index >= visibleRange.start && index < visibleRange.end
  }

  return {
    visibleRange,
    isItemVisible,
  }
}
