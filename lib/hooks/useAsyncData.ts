/**
 * 비동기 데이터 관리를 위한 공통 훅
 * loading, error, data 상태와 fetch 함수를 제공
 */

import { useCallback, useEffect, useState } from 'react'

interface UseAsyncDataOptions<T> {
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

interface UseAsyncDataResult<T> {
  data: T
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  setData: (data: T) => void
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
  const [data, setData] = useState<T>(initialData as T)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    refetch()
  }, [refetch])

  return {
    data,
    loading,
    error,
    refetch,
    setData,
    setError,
  }
}
