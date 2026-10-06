'use server'

import { MESSAGES, PERMISSION_LEVELS, REVALIDATE_PATHS, REVALIDATE_TAGS, ROUTES } from '@/constants'
import { getCurrentUserId } from '@/lib/auth'
import {
  canDeleteCommunity,
  canJoinCommunity,
  prepareCommunityUpdate,
  prepareImageUpload,
} from '@/lib/community/community.core'
import { prisma } from '@/lib/prisma'
import type { UpdateCommunityInput } from '@/lib/types/community'
import {
  assertExists,
  checkPermission,
  type ServerActionResponse,
  withServerAction,
} from '@/lib/utils/serverActions'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath, revalidateTag } from 'next/cache'
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
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      await checkPermission(userId, clubId, PERMISSION_LEVELS.ADMIN)

      const prepared = prepareCommunityUpdate(input)
      if (prepared.isErr()) {
        throw prepared.error
      }

      await prisma.community.update({
        where: { clubId },
        data: prepared.value,
      })

      revalidatePath(REVALIDATE_PATHS.COMMUNITY(clubId))
      revalidateTag(REVALIDATE_TAGS.COMMUNITIES, 'max')
    },
    { errorMessage: MESSAGES.ERROR.COMMUNITY_UPDATE_FAILED }
  )
}

/**
 * Server Action: 커뮤니티 삭제
 */
export async function deleteCommunityAction(clubId: string): Promise<ServerActionResponse> {
  const result = await withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      const community = await prisma.community.findUnique({
        where: { clubId },
        select: { deletedAt: true },
      })
      assertExists(community, '커뮤니티를 찾을 수 없습니다')

      await checkPermission(userId, clubId, PERMISSION_LEVELS.ADMIN)

      const validation = canDeleteCommunity({
        userId,
        isAdmin: true,
        isDeleted: community.deletedAt !== null,
      })
      if (validation.isErr()) {
        throw validation.error
      }

      await prisma.community.update({
        where: { clubId, deletedAt: null },
        data: { deletedAt: new Date() },
      })

      revalidatePath('/community')
      revalidateTag('communities', 'max')
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
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      const existingMember = await prisma.communityMember.findFirst({
        where: { clubId, userId, deletedAt: null },
      })

      const joinDecision = canJoinCommunity({
        userId,
        isExistingMember: Boolean(existingMember),
      })
      if (joinDecision.isErr()) {
        throw joinDecision.error
      }

      await prisma.communityMember.create({
        data: {
          clubId,
          userId: joinDecision.value.userId,
          role: joinDecision.value.role,
        },
      })

      revalidatePath(`/community/${clubId}`)
      revalidateTag('communities', 'max')
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

      await checkPermission(userId, clubId, 'admin')

      const file = formData.get('image') as File | null
      if (!file) {
        throw new Error('이미지 파일이 없습니다')
      }

      const uploadPreparation = prepareImageUpload(
        {
          fileName: file.name,
          fileSize: file.size,
        },
        {
          timestamp: Date.now(),
          randomSuffix: Math.random().toString(36).substring(2),
        }
      )
      if (uploadPreparation.isErr()) {
        throw uploadPreparation.error
      }

      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase 환경 변수가 설정되지 않았습니다')
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { filePath } = uploadPreparation.value

      const { error: uploadError } = await supabase.storage
        .from('community-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`이미지 업로드 실패: ${uploadError.message}`)
      }

      const { data: urlData } = supabase.storage.from('community-images').getPublicUrl(filePath)
      const imageUrl = urlData.publicUrl

      await prisma.community.update({
        where: { clubId },
        data: { imageUrl },
      })

      revalidatePath(`/community/${clubId}`)
      revalidateTag('communities', 'max')
      return { imageUrl }
    },
    { errorMessage: '이미지 업로드에 실패했습니다' }
  )
}
