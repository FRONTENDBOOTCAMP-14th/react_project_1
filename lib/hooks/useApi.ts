/**
 * API 호출을 위한 공통 훅
 * CRUD 작업과 상태 관리를 통합
 */

import { HTTP_HEADERS, MESSAGES } from '@/constants'
import { useCallback } from 'react'
import { useAsyncData } from './useAsyncData'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface UseApiOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

/**
 * API 엔드포인트를 관리하는 커스텀 훅
 * @param endpoint - API 엔드포인트
 * @param options - 옵션
 * @returns API 함수들과 상태
 */
export function useApi<T>(endpoint: string, options: UseApiOptions = {}) {
  const { onSuccess, onError } = options

  const fetchData = useCallback(async (): Promise<T> => {
    const response = await fetch(endpoint)
    const result: ApiResponse<T> = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'API request failed')
    }

    return result.data as T
  }, [endpoint])

  const { data, loading, error, refetch } = useAsyncData(fetchData, {
    onSuccess,
    onError,
  })

  const create = useCallback(
    async (input: unknown): Promise<{ success: boolean; data?: T; error?: string }> => {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
          body: JSON.stringify(input),
        })

        const result: ApiResponse<T> = await response.json()

        if (result.success) {
          await refetch()
          onSuccess?.()
          return { success: true, data: result.data }
        }

        return { success: false, error: result.error || MESSAGES.ERROR.NETWORK_ERROR }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : MESSAGES.ERROR.NETWORK_ERROR
        onError?.(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [endpoint, refetch, onSuccess, onError]
  )

  const update = useCallback(
    async (id: string, input: unknown): Promise<{ success: boolean; data?: T; error?: string }> => {
      try {
        const response = await fetch(`${endpoint}/${id}`, {
          method: 'PATCH',
          headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
          body: JSON.stringify(input),
        })

        const result: ApiResponse<T> = await response.json()

        if (result.success) {
          await refetch()
          onSuccess?.()
          return { success: true, data: result.data }
        }

        return { success: false, error: result.error || MESSAGES.ERROR.NETWORK_ERROR }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : MESSAGES.ERROR.NETWORK_ERROR
        onError?.(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [endpoint, refetch, onSuccess, onError]
  )

  const remove = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch(`${endpoint}/${id}`, {
          method: 'DELETE',
        })

        const result: ApiResponse<null> = await response.json()

        if (result.success) {
          await refetch()
          onSuccess?.()
          return { success: true }
        }

        return { success: false, error: result.error || MESSAGES.ERROR.NETWORK_ERROR }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : MESSAGES.ERROR.NETWORK_ERROR
        onError?.(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [endpoint, refetch, onSuccess, onError]
  )

  const getById = useCallback(
    async (id: string): Promise<{ success: boolean; data?: T; error?: string }> => {
      try {
        const response = await fetch(`${endpoint}/${id}`)
        const result: ApiResponse<T> = await response.json()

        if (result.success) {
          return { success: true, data: result.data }
        }

        return { success: false, error: result.error || MESSAGES.ERROR.NETWORK_ERROR }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : MESSAGES.ERROR.NETWORK_ERROR
        onError?.(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [endpoint, onError]
  )

  return {
    data,
    loading,
    error,
    refetch,
    create,
    update,
    remove,
    getById,
  }
}
