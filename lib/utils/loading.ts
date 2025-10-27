/**
 * 로딩 상태 관리 유틸리티
 * 스켈레톤, 지연 로딩, 풀투리프레시 등
 */

import type { GenericFunction, LoadingState } from '@/lib/types/loading'

/**
 * 지연 로딩 (debounce)
 */
export function debounce<T extends GenericFunction>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * 지연 로딩 (throttle)
 */
export function throttle<T extends GenericFunction>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, wait)
    }
  }
}

/**
 * 지연 실행
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 스켈레톤 로딩을 위한 더미 데이터 생성
 */
export function generateSkeletonItems<T extends Record<string, unknown>>(
  count: number,
  itemTemplate: T = {} as T
): (T & { id: string; isSkeleton: true })[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `skeleton-${index}`,
    isSkeleton: true,
    ...itemTemplate,
  }))
}

/**
 * 스켈레톤 목표 아이템 템플릿
 */
export function generateSkeletonGoals(count: number = 5) {
  return generateSkeletonItems(count, {
    title: '████████████████████',
    description: '████████████████████████████████████████',
    progress: 0,
    isComplete: false,
    createdAt: new Date().toISOString(),
  })
}

/**
 * 스켈레톤 커뮤니티 아이템 템플릿
 */
export function generateSkeletonCommunities(count: number = 3) {
  return generateSkeletonItems(count, {
    name: '████████████████████',
    description: '████████████████████████████████████████',
    memberCount: 0,
    isPublic: true,
    createdAt: new Date().toISOString(),
  })
}

/**
 * 스켈레톤 멤버 아이템 템플릿
 */
export function generateSkeletonMembers(count: number = 8) {
  return generateSkeletonItems(count, {
    username: '██████████',
    nickname: '██████████████',
    role: 'member',
    joinedAt: new Date().toISOString(),
  })
}

/**
 * 풀투리프레시 딜레이
 */
export function withPullToRefreshDelay<T>(
  action: () => Promise<T>,
  minDelay: number = 500
): Promise<T> {
  const startTime = Date.now()

  return action().then(result => {
    const elapsed = Date.now() - startTime
    const remainingDelay = Math.max(0, minDelay - elapsed)

    return delay(remainingDelay).then(() => result)
  })
}

/**
 * 로딩 상태 생성자
 */
export function createLoadingState<T>(initialData: T | null = null): LoadingState<T> {
  return {
    data: initialData,
    loading: false,
    error: null,
  }
}

/**
 * 로딩 상태 업데이트
 */
export function updateLoadingState<T>(
  state: LoadingState<T>,
  updates: Partial<LoadingState<T>>
): LoadingState<T> {
  return {
    ...state,
    ...updates,
  }
}

/**
 * 비동기 작업 래퍼 (로딩 상태 관리)
 */
export async function withLoadingState<T>(
  loadingState: LoadingState<T>,
  asyncFn: () => Promise<T>,
  onStateChange: (state: LoadingState<T>) => void
): Promise<T> {
  // 로딩 시작
  onStateChange(updateLoadingState(loadingState, { loading: true, error: null }))

  try {
    const result = await asyncFn()
    // 성공
    onStateChange(
      updateLoadingState(loadingState, {
        loading: false,
        data: result,
        error: null,
      })
    )
    return result
  } catch (error) {
    // 에러
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    onStateChange(
      updateLoadingState(loadingState, {
        loading: false,
        error: errorMessage,
      })
    )
    throw error
  }
}

/**
 * 무한 스크롤을 위한 다음 페이지 로딩
 */
export function createInfiniteLoader<T>(
  loadMore: (page: number) => Promise<T[]>,
  hasMore: (data: T[]) => boolean
) {
  let currentPage = 1
  let allData: T[] = []
  let loading = false

  return {
    loadInitial: async () => {
      if (loading) return []
      loading = true

      try {
        const data = await loadMore(1)
        allData = data
        currentPage = 2
        return data
      } finally {
        loading = false
      }
    },

    loadMore: async () => {
      if (loading || !hasMore(allData)) return []
      loading = true

      try {
        const data = await loadMore(currentPage)
        allData = [...allData, ...data]
        currentPage++
        return data
      } finally {
        loading = false
      }
    },

    hasMore: () => hasMore(allData),
    isLoading: () => loading,
    getAllData: () => allData,
    reset: () => {
      currentPage = 1
      allData = []
      loading = false
    },
  }
}

/**
 * 이미지 지연 로딩
 */
export function createLazyImageLoader(threshold: number = 100) {
  const imageObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src

          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        }
      })
    },
    { rootMargin: `${threshold}px` }
  )

  return {
    observe: (img: HTMLImageElement) => {
      imageObserver.observe(img)
    },

    unobserve: (img: HTMLImageElement) => {
      imageObserver.unobserve(img)
    },

    disconnect: () => {
      imageObserver.disconnect()
    },
  }
}

/**
 * 콘텐츠 로딩 플레이스홀더
 */
export function createLoadingPlaceholder(
  type: 'goal' | 'community' | 'member' | 'notification',
  count: number = 1
) {
  switch (type) {
    case 'goal':
      return generateSkeletonGoals(count)
    case 'community':
      return generateSkeletonCommunities(count)
    case 'member':
      return generateSkeletonMembers(count)
    case 'notification':
      return generateSkeletonItems(count, {
        title: '████████████████████',
        content: '████████████████████████████████████████',
        createdAt: new Date().toISOString(),
      })
    default:
      return generateSkeletonItems(count, {})
  }
}
