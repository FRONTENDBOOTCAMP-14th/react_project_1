/**
 * API 관련 유틸리티
 * 에러 처리, 응답 변환, 타임아웃, 재시도 로직
 */

/**
 * API 에러 타입 정의
 */
export type ApiErrorType =
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'server'
  | 'not_found'
  | 'rate_limit'
  | 'timeout'
  | 'unknown'

/**
 * API 에러 인터페이스
 */
export interface ApiError {
  type: ApiErrorType
  message: string
  statusCode?: number
  originalError?: unknown
}

/**
 * HTTP 상태코드별 에러 타입 매핑
 */
export function getErrorTypeFromStatusCode(statusCode: number): ApiErrorType {
  if (statusCode >= 400 && statusCode < 500) {
    switch (statusCode) {
      case 401:
        return 'authentication'
      case 403:
        return 'authorization'
      case 404:
        return 'not_found'
      case 422:
        return 'validation'
      case 429:
        return 'rate_limit'
      default:
        return 'validation'
    }
  }

  if (statusCode >= 500) {
    return 'server'
  }

  return 'unknown'
}

/**
 * 에러 객체를 ApiError로 변환
 */
export async function parseApiError(
  error: unknown,
  fallbackMessage: string = '알 수 없는 오류가 발생했습니다.'
): Promise<ApiError> {
  // Next.js API 에러
  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message || fallbackMessage,
      originalError: error,
    }
  }

  // Fetch API 에러
  if (error instanceof Response) {
    return {
      type: getErrorTypeFromStatusCode(error.status),
      message: await getErrorMessageFromResponse(error),
      statusCode: error.status,
    }
  }

  // Supabase 에러
  if (typeof error === 'object' && error !== null) {
    const supabaseError = error as { code?: string; message?: string }
    if (supabaseError.code) {
      return {
        type: getErrorTypeFromSupabaseCode(supabaseError.code),
        message: supabaseError.message || fallbackMessage,
        originalError: supabaseError as unknown,
      }
    }
  }

  // 알 수 없는 에러
  return {
    type: 'unknown',
    message: typeof error === 'string' ? error : fallbackMessage,
    originalError: typeof error === 'object' ? error : undefined,
  }
}

/**
 * Supabase 에러 코드별 타입 매핑
 */
function getErrorTypeFromSupabaseCode(code: string): ApiErrorType {
  switch (code) {
    case 'invalid_credentials':
    case 'email_not_confirmed':
      return 'authentication'
    case 'insufficient_privilege':
      return 'authorization'
    case 'PGRST116': // Row Level Security
      return 'authorization'
    default:
      return 'server'
  }
}

/**
 * HTTP 응답에서 에러 메시지 추출
 */
async function getErrorMessageFromResponse(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const data = await response.json()
      return data.message || data.error || `HTTP ${response.status}`
    }

    return `HTTP ${response.status}: ${response.statusText}`
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`
  }
}

/**
 * 사용자 친화적 에러 메시지로 변환
 */
export function getUserFriendlyErrorMessage(apiError: ApiError): string {
  switch (apiError.type) {
    case 'network':
      return '네트워크 연결을 확인해주세요.'
    case 'authentication':
      return '로그인이 필요합니다. 다시 로그인해주세요.'
    case 'authorization':
      return '접근 권한이 없습니다.'
    case 'validation':
      return '입력 정보를 확인해주세요.'
    case 'server':
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    case 'not_found':
      return '요청한 정보를 찾을 수 없습니다.'
    case 'rate_limit':
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    case 'timeout':
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.'
    default:
      return apiError.message || '알 수 없는 오류가 발생했습니다.'
  }
}

/**
 * 재시도 필요 여부 확인
 */
export function shouldRetry(apiError: ApiError): boolean {
  return (
    apiError.type === 'network' ||
    apiError.type === 'timeout' ||
    (apiError.type === 'server' && apiError.statusCode === 500)
  )
}

/**
 * 재시도 딜레이 계산 (지수 백오프)
 */
export function calculateRetryDelay(attemptNumber: number, baseDelay: number = 1000): number {
  const exponentialDelay = Math.pow(2, attemptNumber) * baseDelay
  const jitter = Math.random() * 0.1 * exponentialDelay // 10% jitter
  return exponentialDelay + jitter
}

/**
 * 타임아웃 에러 생성
 */
export function createTimeoutError(timeoutMs: number): ApiError {
  return {
    type: 'timeout',
    message: `${timeoutMs}ms 내에 응답이 없습니다.`,
    originalError: new Error(`Request timeout after ${timeoutMs}ms`),
  }
}

/**
 * API 응답 타입 안전성 검사
 */
export function isSuccessResponse<T>(
  response: Record<string, unknown>
): response is { success: true; data: T } {
  return (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    response.success === true &&
    'data' in response
  )
}

/**
 * API 응답 타입 안전성 검사
 */
export function isErrorResponse(
  response: Record<string, unknown>
): response is { success: false; error: string } {
  return (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    response.success === false &&
    'error' in response
  )
}

/**
 * API 호출 래퍼 (에러 처리 포함)
 */
export async function withApiErrorHandling<T>(
  apiCall: () => Promise<T>,
  fallbackMessage?: string
): Promise<{ success: true; data: T } | { success: false; error: ApiError }> {
  try {
    const data = await apiCall()
    return { success: true, data }
  } catch (error) {
    const apiError = await parseApiError(error, fallbackMessage)
    return { success: false, error: apiError }
  }
}
