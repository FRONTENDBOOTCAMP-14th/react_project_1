import { useCallback, useEffect, useState } from 'react'

export interface UseAsyncDataOptions<T> {
  initialData: T
  enabled?: boolean
}

export interface UseAsyncDataResult<T> {
  data: T
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * 컴포넌트 마운트 및 의존성 변경 시 비동기 데이터 로딩을 안전하게 처리하는 공통 훅
 *
 * - 언마운트 시 자동 취소(isCancelled)로 메모리 누수 및 에러 방지
 * - React Compiler 및 ESLint 규칙 준수 (render-time state reset 패턴 적용)
 * - 입력 변경 및 refetch 시 loading / error / data 리셋 보장
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions<T>
): UseAsyncDataResult<T> {
  const { initialData, enabled = true } = options

  const [data, setData] = useState<T>(initialData)
  const [loading, setLoading] = useState<boolean>(() => enabled)
  const [error, setError] = useState<string | null>(null)

  const [prev, setPrev] = useState({ fetcher, enabled })
  if (prev.fetcher !== fetcher || prev.enabled !== enabled) {
    setPrev({ fetcher, enabled })
    setLoading(enabled)
    setError(null)
    if (!enabled) {
      setData(initialData)
    }
  }

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetcher()
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    if (!enabled) return

    let ignore = false

    const load = async () => {
      try {
        const result = await fetcher()
        if (!ignore) {
          setData(result)
        }
      } catch (err) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : String(err)
          setError(message)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [enabled, fetcher])

  return {
    data,
    loading,
    error,
    refetch,
  }
}
