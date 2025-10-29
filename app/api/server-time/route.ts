/**
 * 서버 시간 API
 * - 경로: /api/server-time
 * - 메서드: GET
 * - 목적: 클라이언트에 정확한 서버 UTC 시간 제공
 */

import { NextResponse } from 'next/server'

/**
 * GET /api/server-time
 * 서버의 현재 UTC 시간을 반환합니다.
 *
 * @returns {
 *   serverTime: string - ISO 8601 형식의 UTC 시간
 *   timestamp: number - Unix timestamp (밀리초)
 * }
 */
export async function GET() {
  const now = new Date()

  return NextResponse.json({
    serverTime: now.toISOString(),
    timestamp: now.getTime(),
  })
}
