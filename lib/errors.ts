export function isError(err: unknown): err is Error {
  return err instanceof Error
}

export function getErrorMessage(err: unknown, fallback = 'Unknown error'): string {
  if (isError(err)) return err.message
  return fallback
}

// Type guard for error objects that may carry a string code (e.g., Prisma errors)
export function hasErrorCode<T extends string = string>(
  err: unknown,
  code?: T
): err is { code: T } & object {
  if (!err || typeof err !== 'object') return false
  const obj = err as Record<string, unknown>
  if (typeof obj.code !== 'string') return false
  return code ? obj.code === code : true
}

/**
 * 검색 관련 커스텀 에러 클래스
 */
export class SearchError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'SearchError'
  }
}

/**
 * 알림 관련 커스텀 에러 클래스
 */
export class NotificationError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'NotificationError'
  }
}

/**
 * 멤버 관련 커스텀 에러 클래스
 */
export class MemberError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'MemberError'
  }
}

/**
 * 검색 입력 검증 에러
 */
export class SearchValidationError extends SearchError {
  constructor(message: string) {
    super(message, 'SEARCH_VALIDATION_ERROR', 400)
    this.name = 'SearchValidationError'
  }
}

/**
 * 검색 결과 없음 에러
 */
export class SearchNotFoundError extends SearchError {
  constructor(message: string = '검색 결과가 없습니다.') {
    super(message, 'SEARCH_NOT_FOUND', 404)
    this.name = 'SearchNotFoundError'
  }
}
