/**
 * 사용자 프로필 API
 * - 경로: /api/user
 * - 메서드:
 *   - PUT: 프로필 수정
 */

import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'

interface CustomSession {
  userId?: string
}

/**
 * PUT /api/user
 * - 사용자 프로필을 수정합니다.
 *
 * 요청 Body 예시
 * {
 *   "username": "새이름",
 *   "nickname": "새닉네임"
 * }
 *
 * 응답
 * - 200: { success: true, data: User }
 * - 400: { success: false, error: string }
 * - 401: { success: false, error: string }
 * - 500: { success: false, error: string }
 */
export async function PUT(request: NextRequest) {
  try {
    // 인증 확인
    const session = (await getServerSession(authOptions)) as CustomSession
    const userId = session?.userId

    if (!userId) {
      return createErrorResponse('인증이 필요합니다', 401)
    }

    const body = await request.json()
    const { username, nickname } = body

    // 필수 값 검증
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return createErrorResponse('유효한 이름을 입력해주세요', 400)
    }

    // nickname은 선택적이지만, 제공된 경우 문자열이어야 함
    if (nickname !== undefined && nickname !== null && typeof nickname !== 'string') {
      return createErrorResponse('유효한 닉네임을 입력해주세요', 400)
    }

    // 사용자 업데이트
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        username: username.trim(),
        nickname: nickname ? nickname.trim() : null,
        updatedAt: new Date(),
      },
      select: {
        userId: true,
        username: true,
        email: true,
        nickname: true,
        updatedAt: true,
      },
    })

    return createSuccessResponse(updatedUser, 200)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return createErrorResponse('프로필 수정에 실패했습니다', 500)
  }
}
