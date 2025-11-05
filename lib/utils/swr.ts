/**
 * SWR 데이터 페칭 유틸리티
 * - API 요청을 표준화하고 에러 처리를 통합합니다
 */

import { HTTP_HEADERS } from '@/constants'

// API 응답 기본 타입
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * 기본 GET fetcher
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result: ApiResponse<T> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'API request failed')
  }

  // data가 배열인 경우와 객체인 경우 모두 처리
  return (result.data as T) ?? (result as unknown as T)
}

/**
 * POST 요청 fetcher
 */
export async function poster<T = unknown>(url: string, data: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result: ApiResponse<T> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'API request failed')
  }

  return result.data as T
}

/**
 * PATCH 요청 fetcher
 */
export async function patcher<T = unknown>(url: string, data: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result: ApiResponse<T> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'API request failed')
  }

  return result.data as T
}

/**
 * DELETE 요청 fetcher
 */
export async function deleter<T = unknown>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result: ApiResponse<T> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'API request failed')
  }

  return result.data as T
}
