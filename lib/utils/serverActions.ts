/**
 * Server Actions 공통 유틸리티
 * 일관된 에러 처리, 응답 형식, 로깅을 제공합니다.
 */

import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

/**
 * Server Action 응답 타입
 */
export interface ServerActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server Action 에러 타입
 */
export class ServerActionError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = 'ServerActionError'
  }
}

/**
 * Server Action을 감싸서 공통 에러 처리를 제공하는 래퍼
 * @param action - 실행할 비즈니스 로직
 * @param options - 옵션 (인증 필요 여부 등)
 * @returns 표준화된 응답 형식
 */
export async function withServerAction<T>(
  action: () => Promise<T>,
  options: {
    requireAuth?: boolean
    errorMessage?: string
    actionName?: string
  } = {}
): Promise<ServerActionResponse<T>> {
  const actionName = options.actionName || 'UnknownAction'

  try {
    logger.debug(`Server Action started: ${actionName}`)

    // 인증 확인
    if (options.requireAuth !== false) {
      const userId = await getCurrentUserId()
      if (!userId) {
        logger.warn(`Authentication failed for action: ${actionName}`)
        return {
          success: false,
          error: '인증이 필요합니다',
        }
      }
      logger.debug(`Authentication successful for action: ${actionName}`, { userId })
    }

    // 비즈니스 로직 실행
    const data = await action()

    logger.info(`Server Action completed successfully: ${actionName}`)

    return {
      success: true,
      data,
    }
  } catch (error) {
    logger.actionError(actionName, error instanceof Error ? error.message : String(error), {
      options,
    })

    // ServerActionError 처리
    if (error instanceof ServerActionError) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Prisma 에러 처리
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: unknown }

      switch (prismaError.code) {
        case 'P2002':
          return {
            success: false,
            error: '이미 존재하는 데이터입니다',
          }
        case 'P2025':
          return {
            success: false,
            error: '데이터를 찾을 수 없습니다',
          }
        case 'P2003':
          return {
            success: false,
            error: '관련된 데이터를 찾을 수 없습니다',
          }
        default:
          return {
            success: false,
            error: options.errorMessage || '데이터베이스 오류가 발생했습니다',
          }
      }
    }

    // 일반 에러 처리
    return {
      success: false,
      error: options.errorMessage || '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 권한을 확인하는 유틸리티 함수
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @param requiredRole - 필요한 역할 (admin 등)
 * @throws ServerActionError - 권한이 없을 경우
 */
export async function checkPermission(
  userId: string,
  clubId: string,
  requiredRole: 'admin' | 'member' = 'member'
): Promise<void> {
  const member = await prisma.communityMember.findFirst({
    where: {
      clubId,
      userId,
      deletedAt: null, // 삭제된 멤버십 제외
      ...(requiredRole === 'admin' && { role: 'admin' }),
    },
  })

  if (!member) {
    throw new ServerActionError(
      requiredRole === 'admin' ? '관리자 권한이 필요합니다' : '멤버 권한이 필요합니다',
      'PERMISSION_DENIED',
      403
    )
  }
}

/**
 * 데이터 존재 여부를 확인하는 유틸리티
 * @param data - 확인할 데이터
 * @param errorMessage - 에러 메시지
 * @throws ServerActionError - 데이터가 없을 경우
 */
export function assertExists<T>(
  data: T | null | undefined,
  errorMessage: string
): asserts data is T {
  if (!data) {
    throw new ServerActionError(errorMessage, 'NOT_FOUND', 404)
  }
}
