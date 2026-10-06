/**
 * 로딩 상태 관리 유틸리티
 * 스켈레톤, 지연 로딩, 풀투리프레시 등
 */

import type { GenericFunction } from '@/lib/types/loading'

/**
 * 지연 로딩 (debounce)
 */
export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  wait: number
): (...args: TArgs) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: TArgs) => {
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
