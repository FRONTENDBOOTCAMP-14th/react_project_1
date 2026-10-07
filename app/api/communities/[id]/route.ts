/**
 * 커뮤니티 단건 API
 * - 경로: /api/communities/[id]
 * - 메서드:
 *   - GET: 특정 커뮤니티 상세 조회
 *   - PATCH: 특정 커뮤니티 부분 수정
 *   - DELETE: 특정 커뮤니티 소프트 삭제
 */

import { MESSAGES } from '@/constants/messages'
import { getCurrentUserId, hasPermission } from '@/lib/auth'
import { canDeleteCommunity, prepareCommunityUpdate } from '@/lib/community/community.core'
import {
  findCommunityById,
  softDeleteCommunity,
  updateCommunity,
} from '@/lib/community/community.server'
import { getErrorMessage, hasErrorCode } from '@/lib/errors'
import prisma from '@/lib/prisma'
import { requireAuthUser } from '@/lib/utils/api-auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import type { NextRequest } from 'next/server'

/**
 * GET /api/communities/[id]
 * - 특정 커뮤니티의 상세 정보를 조회합니다.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 커뮤니티 조회
    const community = await prisma.community.findUnique({
      where: {
        clubId: id,
      },
      select: {
        clubId: true,
        name: true,
        description: true,
        isPublic: true,
        region: true,
        subRegion: true,
        imageUrl: true,
        createdAt: true,
        tagname: true,
        deletedAt: true,
        _count: {
          select: {
            communityMembers: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    })

    // 커뮤니티가 없거나 소프트 삭제된 경우
    if (community?.deletedAt !== null) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    // 비공개 커뮤니티 접근 제어
    if (!community.isPublic) {
      const userId = await getCurrentUserId()
      if (!userId) {
        return createErrorResponse(MESSAGES.ERROR.AUTH_REQUIRED, 401)
      }

      const isMember = await hasPermission(userId, id, 'member')
      if (!isMember) {
        return createErrorResponse(MESSAGES.ERROR.FORBIDDEN, 403)
      }
    }

    // deletedAt 필드 제거 후 응답 (createdAt을 string으로 변환)
    const { deletedAt: _deletedAt, ...communityData } = community
    return createSuccessResponse({
      ...communityData,
      createdAt: community.createdAt.toISOString(),
    })
  } catch (err: unknown) {
    console.error('Error fetching community:', err)
    return createErrorResponse(getErrorMessage(err, MESSAGES.ERROR.FAILED_TO_LOAD_COMMUNITY), 500)
  }
}

/**
 * PATCH /api/communities/[id]
 * - 커뮤니티 일부 필드를 부분 수정합니다.
 * - 권한: 팀장만 수정 가능
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    const body = await request.json()

    // 1) 대상 존재 확인 (소프트 삭제 제외)
    const existingCommunity = await findCommunityById(id)
    if (!existingCommunity) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    // 팀장 권한 확인
    const hasAdminPermission = await hasPermission(userId, id, 'admin')
    if (!hasAdminPermission) {
      return createErrorResponse('팀장만 커뮤니티를 수정할 수 있습니다.', 403)
    }

    // 수정 데이터 검증 및 정제
    const prepared = prepareCommunityUpdate(body)
    if (prepared.isErr()) {
      return createErrorResponse(prepared.error.message, 400)
    }

    // 커뮤니티 수정
    const updatedCommunity = await updateCommunity(id, prepared.value)

    return createSuccessResponse(updatedCommunity)
  } catch (err: unknown) {
    console.error('Error updating community:', err)

    // Unique 제약 위반
    if (hasErrorCode(err, 'P2002')) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NAME_EXISTS, 400)
    }

    return createErrorResponse(getErrorMessage(err, MESSAGES.ERROR.FAILED_TO_UPDATE_COMMUNITY), 500)
  }
}

/**
 * DELETE /api/communities/[id]
 * - 커뮤니티를 소프트 삭제합니다.
 * - 권한: 팀장만 삭제 가능
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    // 커뮤니티 존재 확인
    const existingCommunity = await findCommunityById(id)
    if (!existingCommunity) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    // 팀장 권한 확인
    const hasAdminPermission = await hasPermission(userId, id, 'admin')

    // 삭제 권한 및 상태 검증
    const validation = canDeleteCommunity({
      isAdmin: hasAdminPermission,
      isDeleted: false,
    })
    if (validation.isErr()) {
      return createErrorResponse(validation.error.message, !hasAdminPermission ? 403 : 400)
    }

    // 커뮤니티 삭제
    await softDeleteCommunity(id)

    return createSuccessResponse({ message: 'Community deleted successfully' })
  } catch (err: unknown) {
    console.error('Error deleting community:', err)

    if (hasErrorCode(err, 'P2025')) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    return createErrorResponse(getErrorMessage(err, MESSAGES.ERROR.FAILED_TO_DELETE_COMMUNITY), 500)
  }
}
