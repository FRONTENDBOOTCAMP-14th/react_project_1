/**
 * 비동기 데이터 관리를 위한 공통 훅
 * loading, error, data 상태와 fetch 함수를 제공
 */

import { useCallback, useEffect, useState, useRef } from 'react'

interface UseAsyncDataOptions<T> {
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

interface UseAsyncDataResult<T> {
  data: T | undefined
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  setData: (data: T | undefined) => void
  setError: (error: string | null) => void
}

/**
 * 비동기 데이터 상태를 관리하는 커스텀 훅
 * @param fetchFn - 데이터를 가져오는 함수
 * @param options - 옵션
 * @returns 데이터 상태와 제어 함수들
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataResult<T> {
  const { initialData, onSuccess, onError } = options
  const [data, setData] = useState<T | undefined>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // fetchFn이 변경되지 않았는지 추적 (무한 루프 방지)
  const fetchFnRef = useRef(fetchFn)
  const isInitialMountRef = useRef(true)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await fetchFn()

      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, onSuccess, onError])

  useEffect(() => {
    // fetchFn이 실제로 변경되었는지 확인 (무한 루프 방지)
    if (fetchFnRef.current !== fetchFn) {
      fetchFnRef.current = fetchFn
      isInitialMountRef.current = false
      refetch()
    } else if (isInitialMountRef.current) {
      // 초기 마운트인 경우에만 실행
      isInitialMountRef.current = false
      refetch()
    }
  }, [fetchFn, refetch])

  return {
    data,
    loading,
    error,
    refetch,
    setData,
    setError,
  }
}
