import { NextResponse } from 'next/server'

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string }

export function createSuccessResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function createErrorResponse(error: Error | string, status = 500) {
  const message = error instanceof Error ? error.message : error
  return NextResponse.json({ success: false, error: message }, { status })
}
