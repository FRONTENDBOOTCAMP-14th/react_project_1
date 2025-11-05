/**
 * Community/[id] 페이지에서 사용하는 에러 핸들링 유틸리티
 */

/**
 * 커뮤니티 관련 에러 타입
 */
export enum CommunityErrorType {
  NOT_FOUND = 'COMMUNITY_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 커뮤니티 에러 클래스
 */
export class CommunityError extends Error {
  public readonly type: CommunityErrorType
  public readonly statusCode?: number

  constructor(
    message: string,
    type: CommunityErrorType = CommunityErrorType.UNKNOWN_ERROR,
    statusCode?: number
  ) {
    super(message)
    this.name = 'CommunityError'
    this.type = type
    this.statusCode = statusCode
  }
}

/**
 * 에러 타입을 기반으로 사용자에게 표시할 메시지를 반환합니다.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof CommunityError) {
    switch (error.type) {
      case CommunityErrorType.NOT_FOUND:
        return '커뮤니티를 찾을 수 없습니다.'
      case CommunityErrorType.PERMISSION_DENIED:
        return '접근 권한이 없습니다.'
      case CommunityErrorType.NETWORK_ERROR:
        return '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.'
      case CommunityErrorType.VALIDATION_ERROR:
        return '입력값이 올바르지 않습니다.'
      default:
        return error.message || '알 수 없는 오류가 발생했습니다.'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return '알 수 없는 오류가 발생했습니다.'
}

/**
 * API 응답 에러를 CommunityError로 변환합니다.
 */
export function parseApiError(error: unknown): CommunityError {
  if (error instanceof CommunityError) {
    return error
  }

  if (error instanceof Error) {
    // 네트워크 에러 확인
    if (error.message.includes('fetch')) {
      return new CommunityError('서버와 통신할 수 없습니다.', CommunityErrorType.NETWORK_ERROR)
    }

    // 상태 코드 기반 에러 분류
    const statusCodeMatch = error.message.match(/status (\d+)/)
    const statusCode = statusCodeMatch ? parseInt(statusCodeMatch[1]) : undefined

    switch (statusCode) {
      case 404:
        return new CommunityError(
          '커뮤니티를 찾을 수 없습니다.',
          CommunityErrorType.NOT_FOUND,
          statusCode
        )
      case 403:
        return new CommunityError(
          '접근 권한이 없습니다.',
          CommunityErrorType.PERMISSION_DENIED,
          statusCode
        )
      case 400:
        return new CommunityError(
          '요청이 올바르지 않습니다.',
          CommunityErrorType.VALIDATION_ERROR,
          statusCode
        )
      default:
        return new CommunityError(error.message, CommunityErrorType.UNKNOWN_ERROR, statusCode)
    }
  }

  return new CommunityError('알 수 없는 오류가 발생했습니다.')
}
