'use server'

import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ServerActionResponse } from '@/lib/utils/serverActions'
import { assertExists, withServerAction } from '@/lib/utils/serverActions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Server Action: 프로필 업데이트
 */
export async function updateProfileAction(input: {
  username: string
  nickname?: string | null
}): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      // username 유효성 검증
      if (!input.username.trim()) {
        throw new Error('이름을 입력해주세요')
      }

      // 프로필 업데이트
      await prisma.user.update({
        where: { userId },
        data: {
          username: input.username.trim(),
          nickname: input.nickname?.trim() || null,
        },
      })

      // 프로필 페이지 재검증
      revalidatePath('/profile')
    },
    { errorMessage: '프로필 업데이트에 실패했습니다' }
  )
}

/**
 * Server Action: 회원 탈퇴
 */
export async function deleteAccountAction(): Promise<ServerActionResponse> {
  const result = await withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      // Soft delete
      await prisma.user.update({
        where: { userId },
        data: { deletedAt: new Date() },
      })
    },
    { errorMessage: '회원 탈퇴에 실패했습니다' }
  )

  // 성공 시 로그인 페이지로 리다이렉트
  if (result.success) {
    redirect('/login')
  }

  return result
}
