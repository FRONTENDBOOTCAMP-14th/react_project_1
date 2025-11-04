'use server'

import { ROUTES } from '@/constants'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { UpdateCommunityInput } from '@/lib/types/community'
import {
  assertExists,
  checkPermission,
  type ServerActionResponse,
  withServerAction,
} from '@/lib/utils/serverActions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Server Action: 커뮤니티 정보 업데이트
 */
export async function updateCommunityAction(
  clubId: string,
  input: UpdateCommunityInput
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      // 관리자 권한 확인
      await checkPermission(userId, clubId, 'admin')

      // 커뮤니티 업데이트
      await prisma.community.update({
        where: { clubId },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.region !== undefined && { region: input.region }),
          ...(input.subRegion !== undefined && { subRegion: input.subRegion }),
          ...(input.tagname && { tagname: input.tagname }),
          ...(input.imageUrl && { imageUrl: input.imageUrl }),
        },
      })

      revalidatePath(`/community/${clubId}`)
    },
    { errorMessage: '커뮤니티 업데이트에 실패했습니다' }
  )
}

/**
 * Server Action: 커뮤니티 삭제
 */
export async function deleteCommunityAction(clubId: string): Promise<ServerActionResponse> {
  const result = await withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      // 관리자 권한 확인
      await checkPermission(userId, clubId, 'admin')

      // 커뮤니티 삭제
      await prisma.community.delete({
        where: { clubId },
      })

      revalidatePath('/community')
    },
    { errorMessage: '커뮤니티 삭제에 실패했습니다' }
  )

  if (result.success) {
    redirect(ROUTES.COMMUNITY.LIST)
  }

  return result
}

/**
 * Server Action: 커뮤니티 가입
 */
export async function joinCommunityAction(clubId: string): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      // 이미 가입했는지 확인
      const existingMember = await prisma.communityMember.findFirst({
        where: { clubId, userId },
      })

      if (existingMember) {
        throw new Error('이미 가입된 커뮤니티입니다')
      }

      // 멤버 추가
      await prisma.communityMember.create({
        data: {
          clubId,
          userId,
          role: 'member',
        },
      })

      revalidatePath(`/community/${clubId}`)
    },
    { errorMessage: '커뮤니티 가입에 실패했습니다' }
  )
}

/**
 * Server Action: 커뮤니티 이미지 업로드
 */
export async function uploadCommunityImageAction(
  clubId: string,
  formData: FormData
): Promise<ServerActionResponse<{ imageUrl: string }>> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      // 관리자 권한 확인
      await checkPermission(userId, clubId, 'admin')

      // 이미지 파일 확인
      const file = formData.get('image') as File
      if (!file) {
        throw new Error('이미지 파일이 없습니다')
      }

      // TODO: 실제 이미지 업로드 로직 구현 (S3, Cloudinary 등)
      const imageUrl = '/placeholder-image.jpg'

      // 커뮤니티 이미지 URL 업데이트
      await prisma.community.update({
        where: { clubId },
        data: { imageUrl },
      })

      revalidatePath(`/community/${clubId}`)
      return { imageUrl }
    },
    { errorMessage: '이미지 업로드에 실패했습니다' }
  )
}
