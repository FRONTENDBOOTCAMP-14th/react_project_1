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

