/**
 * 커서 기반 페이지네이션 React Hook
 * - Server Actions와 함께 사용
 * - 무한 스크롤 및 버튼 기반 페이지네이션 지원
 */

import type { CursorPaginationResult } from '@/lib/pagination/cursorPagination'
import { useCallback, useRef, useState } from 'react'

/**
 * 커서 페이지네이션 Hook 파라미터
 */
export interface UseCursorPaginationParams<T> {
  initialData?: CursorPaginationResult<T>
  fetchFunction: (params: { cursor?: string; limit?: number }) => Promise<CursorPaginationResult<T>>
  pageSize?: number
}

/**
 * 커서 페이지네이션 Hook 반환값
 */
export interface UseCursorPaginationReturn<T> {
  data: T[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  hasMore: boolean
  hasNextPage: boolean
  hasPreviousPage: boolean

  // 액션 함수
  loadNextPage: () => Promise<void>
  loadPreviousPage: () => Promise<void>
  reset: () => void

  // 상태 정보
  nextCursor?: string
  prevCursor?: string
  totalCount: number
}

/**
 * 커서 기반 페이지네이션 Hook
 */
export function useCursorPagination<T>({
  initialData,
  fetchFunction,
  pageSize = 20,
}: UseCursorPaginationParams<T>): UseCursorPaginationReturn<T> {
  const [data, setData] = useState<T[]>(initialData?.data || [])
  const [nextCursor, setNextCursor] = useState<string | undefined>(initialData?.nextCursor)
  const [prevCursor, setPrevCursor] = useState<string | undefined>(initialData?.prevCursor)
  const [hasMore, setHasMore] = useState(initialData?.hasMore || false)
  const [hasPrevious, setHasPrevious] = useState(initialData?.hasPrevious || false)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 초기 데이터 참조 저장
  const initialDataRef = useRef(initialData)

  /**
   * 다음 페이지 로드
   */
  const loadNextPage = useCallback(async () => {
    if (!nextCursor || isLoading || !hasMore) return

    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const result = await fetchFunction({
        cursor: nextCursor,
        limit: pageSize,
      })

      setData(prevData => [...prevData, ...result.data])
      setNextCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } catch (err) {
      setIsError(true)
      setError(err instanceof Error ? err : new Error('Failed to load next page'))
    } finally {
      setIsLoading(false)
    }
  }, [nextCursor, isLoading, hasMore, fetchFunction, pageSize])

  /**
   * 이전 페이지 로드
   */
  const loadPreviousPage = useCallback(async () => {
    if (!prevCursor || isLoading || !hasPrevious) return

    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const result = await fetchFunction({
        cursor: prevCursor,
        limit: pageSize,
      })

      setData(result.data)
      setNextCursor(result.nextCursor)
      setPrevCursor(result.prevCursor)
      setHasMore(result.hasMore)
      setHasPrevious(result.hasPrevious)
    } catch (err) {
      setIsError(true)
      setError(err instanceof Error ? err : new Error('Failed to load previous page'))
    } finally {
      setIsLoading(false)
    }
  }, [prevCursor, isLoading, hasPrevious, fetchFunction, pageSize])

  /**
   * 초기 상태로 리셋
   */
  const reset = useCallback(() => {
    if (initialDataRef.current) {
      setData(initialDataRef.current.data)
      setNextCursor(initialDataRef.current.nextCursor)
      setPrevCursor(initialDataRef.current.prevCursor)
      setHasMore(initialDataRef.current.hasMore)
      setHasPrevious(initialDataRef.current.hasPrevious)
    } else {
      setData([])
      setNextCursor(undefined)
      setPrevCursor(undefined)
      setHasMore(false)
      setHasPrevious(false)
    }

    setIsLoading(false)
    setIsError(false)
    setError(null)
  }, [])

  return {
    data,
    isLoading,
    isError,
    error,
    hasMore,
    hasNextPage: !!nextCursor && hasMore,
    hasPreviousPage: !!prevCursor && hasPrevious,

    loadNextPage,
    loadPreviousPage,
    reset,

    nextCursor,
    prevCursor,
    totalCount: data.length,
  }
}

/**
 * 무한 스크롤용 커서 페이지네이션 Hook
 */
export function useInfiniteCursorPagination<T>({
  initialData,
  fetchFunction,
  pageSize = 20,
}: UseCursorPaginationParams<T>) {
  const { data, isLoading, isError, error, hasMore, hasNextPage, loadNextPage, reset, totalCount } =
    useCursorPagination({
      initialData,
      fetchFunction,
      pageSize,
    })

  return {
    data,
    isLoading,
    isError,
    error,
    hasMore,
    hasNextPage,
    loadNextPage,
    reset,
    totalCount,

    // 무한 스크롤용 추가 함수
    loadMore: loadNextPage,
    isFetchingNextPage: isLoading,
  }
}
