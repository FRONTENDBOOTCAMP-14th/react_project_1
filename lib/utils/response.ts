import { NextResponse } from 'next/server'

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; details?: unknown }

export function createSuccessResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function createErrorResponse(
  error: Error | string,
  status = 500,
  code?: string,
  details?: unknown
) {
  const message = error instanceof Error ? error.message : error
  const response: { success: false; error: string; code?: string; details?: unknown } = {
    success: false,
    error: message,
  }

  if (code) response.code = code
  if (details) response.details = details

  return NextResponse.json(response, { status })
}

// 에러 코드 상수
export const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  ADMIN_REQUIRED: 'ADMIN_REQUIRED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
} as const
