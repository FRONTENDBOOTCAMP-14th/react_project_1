import prisma from '@/lib/prisma'
import { getErrorMessage } from '@/lib/errors'
import { requireAuthUser } from '@/lib/utils/api-auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'

export async function POST() {
  try {
    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    // 사용자 계정 소프트 삭제
    await prisma.user.update({ where: { userId }, data: { deletedAt: new Date() } })
    return createSuccessResponse({ message: '계정이 삭제되었습니다.' })
  } catch (e: unknown) {
    console.error('Error deleting user account:', e)
    return createErrorResponse(getErrorMessage(e, '계정 삭제에 실패했습니다.'), 500)
  }
}
