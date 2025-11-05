/**
 * 전역 에러 핸들링 유틸리티
 * 일관된 에러 처리 및 사용자 피드백 제공
 */

import { MESSAGES } from '@/constants'
import { logger } from '@/lib/utils/logger'
import { ERROR_CODES } from '@/lib/utils/response'

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorContext {
  component?: string
  action?: string
  endpoint?: string
  userId?: string
  [key: string]: string | number | boolean | unknown
}

export interface ErrorInfo {
  type: ErrorType
  message: string
  userMessage: string
  code?: string
  context?: ErrorContext
  originalError?: Error
}

/**
 * 에러 타입을 분류합니다
 */
export function classifyError(error: Error | string, _context?: ErrorContext): ErrorType {
  const message = typeof error === 'string' ? error : error.message

  // 네트워크 에러
  if (message.includes('fetch') || message.includes('network') || message.includes('ENOTFOUND')) {
    return ErrorType.NETWORK
  }

  // 인증 에러
  if (message.includes('auth') || message.includes('login') || message.includes('unauthorized')) {
    return ErrorType.AUTHENTICATION
  }

  // 권한 에러
  if (
    message.includes('permission') ||
    message.includes('forbidden') ||
    message.includes('admin')
  ) {
    return ErrorType.AUTHORIZATION
  }

  // 검증 에러
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required')
  ) {
    return ErrorType.VALIDATION
  }

  // 찾을 수 없음 에러
  if (message.includes('not found') || message.includes('404')) {
    return ErrorType.NOT_FOUND
  }

  // 서버 에러
  if (message.includes('server') || message.includes('500') || message.includes('database')) {
    return ErrorType.SERVER
  }

  return ErrorType.UNKNOWN
}

/**
 * 사용자에게 표시할 메시지를 가져옵니다
 */
export function getUserMessage(errorType: ErrorType, originalMessage?: string): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return MESSAGES.ERROR.NETWORK_ERROR
    case ErrorType.AUTHENTICATION:
      return MESSAGES.ERROR.AUTH_REQUIRED
    case ErrorType.AUTHORIZATION:
      return MESSAGES.ERROR.ADMIN_REQUIRED
    case ErrorType.VALIDATION:
      return originalMessage || MESSAGES.ERROR.UNEXPECTED_ERROR
    case ErrorType.NOT_FOUND:
      return MESSAGES.ERROR.COMMUNITY_NOT_FOUND
    case ErrorType.SERVER:
      return MESSAGES.ERROR.TEMPORARY_ERROR
    default:
      return MESSAGES.ERROR.UNEXPECTED_ERROR
  }
}

/**
 * 에러 코드를 가져옵니다
 */
export function getErrorCode(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return ERROR_CODES.NETWORK_ERROR
    case ErrorType.AUTHENTICATION:
      return ERROR_CODES.AUTH_REQUIRED
    case ErrorType.AUTHORIZATION:
      return ERROR_CODES.ADMIN_REQUIRED
    case ErrorType.VALIDATION:
      return ERROR_CODES.VALIDATION_ERROR
    case ErrorType.NOT_FOUND:
      return ERROR_CODES.NOT_FOUND
    case ErrorType.SERVER:
      return ERROR_CODES.SERVER_ERROR
    default:
      return ERROR_CODES.SERVER_ERROR
  }
}

/**
 * 전역 에러 핸들러
 */
export class GlobalErrorHandler {
  /**
   * 에러를 처리하고 표준화된 에러 정보를 반환합니다
   */
  static handle(error: Error | string, context?: ErrorContext): ErrorInfo {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    const errorType = classifyError(errorObj, context)
    const userMessage = getUserMessage(errorType, errorObj.message)
    const code = getErrorCode(errorType)

    const errorInfo: ErrorInfo = {
      type: errorType,
      message: errorObj.message,
      userMessage,
      code,
      context,
      originalError: errorObj,
    }

    // 에러 로깅
    logger.error('Error handled by GlobalErrorHandler', context, errorObj)

    return errorInfo
  }

  /**
   * API 에러를 처리합니다
   */
  static handleApiError(
    endpoint: string,
    method: string,
    error: Error | string,
    context?: ErrorContext
  ): ErrorInfo {
    return this.handle(error, {
      ...context,
      endpoint,
      method,
      type: 'API',
    })
  }

  /**
   * Server Action 에러를 처리합니다
   */
  static handleActionError(
    actionName: string,
    error: Error | string,
    context?: ErrorContext
  ): ErrorInfo {
    return this.handle(error, {
      ...context,
      actionName,
      type: 'ServerAction',
    })
  }

  /**
   * 컴포넌트 에러를 처리합니다
   */
  static handleComponentError(componentName: string, error: Error, errorInfo?: unknown): ErrorInfo {
    return this.handle(error, {
      componentName,
      errorInfo,
      type: 'Component',
    })
  }

  /**
   * 사용자에게 친화적인 에러 메시지를 표시합니다 (toast 등)
   */
  static showErrorToUser(errorInfo: ErrorInfo, showToast?: (message: string) => void): void {
    const message = errorInfo.userMessage

    if (showToast) {
      showToast(message)
    } else {
      // 기본 콘솔 출력 (실제로는 toast나 notification으로 대체)
      console.warn('User Error:', message)
    }
  }
}

/**
 * 간편한 에러 처리 함수
 */
export function handleError(error: Error | string, context?: ErrorContext): ErrorInfo {
  return GlobalErrorHandler.handle(error, context)
}

/**
 * API 에러 처리 함수
 */
export function handleApiError(
  endpoint: string,
  method: string,
  error: Error | string,
  context?: ErrorContext
): ErrorInfo {
  return GlobalErrorHandler.handleApiError(endpoint, method, error, context)
}

/**
 * Server Action 에러 처리 함수
 */
export function handleActionError(
  actionName: string,
  error: Error | string,
  context?: ErrorContext
): ErrorInfo {
  return GlobalErrorHandler.handleActionError(actionName, error, context)
}

/**
 * 컴포넌트 에러 처리 함수
 */
export function handleComponentError(
  componentName: string,
  error: Error,
  errorInfo: unknown
): ErrorInfo {
  return GlobalErrorHandler.handleComponentError(componentName, error, errorInfo)
}
