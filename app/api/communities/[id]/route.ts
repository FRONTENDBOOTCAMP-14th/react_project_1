/**
 * 커뮤니티 단건 API
 * - 경로: /api/communities/[id]
 * - 메서드:
 *   - GET: 특정 커뮤니티 상세 조회
 *   - PATCH: 특정 커뮤니티 부분 수정
 *   - DELETE: 특정 커뮤니티 소프트 삭제
 */

import prisma from '@/lib/prisma'
import type { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import { MESSAGES } from '@/constants/messages'
import { getErrorMessage, hasErrorCode } from '@/lib/errors'
import { requireAuthUser } from '@/lib/utils/api-auth'
import { hasPermission } from '@/lib/auth'

/**
 * GET /api/communities/[id]
 * - 특정 커뮤니티의 상세 정보를 조회합니다.
 * - 파라미터
 *   - params.id: 조회할 커뮤니티의 clubId(필수)
 *
 * 응답
 * - 200: { success: true, data: Community }
 * - 404: { success: false, error: string }
 * - 500: { success: false, error: string }
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
    if (!community || community.deletedAt !== null) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
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
 * - 파라미터
 *   - params.id: 수정할 커뮤니티의 clubId(필수)
 * - 요청 Body (전부 선택)
 *   - name?: string
 *   - description?: string | null
 *   - isPublic?: boolean
 *   - region?: string | null
 *   - subRegion?: string | null
 *
 * 응답
 * - 200: { success: true, data: UpdatedCommunity }
 * - 404: { success: false, error: string }
 * - 500: { success: false, error: string }
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    const body = await request.json()

    // 1) 대상 존재 확인 (소프트 삭제 제외)
    const existingCommunity = await prisma.community.findFirst({
      where: { clubId: id, deletedAt: null },
    })

    if (!existingCommunity) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    // 팀장 권한 확인
    const hasAdminPermission = await hasPermission(userId, id, 'admin')
    if (!hasAdminPermission) {
      return createErrorResponse('팀장만 커뮤니티를 수정할 수 있습니다.', 403)
    }

    // 2) 동적 업데이트 데이터 구성
    const updateData: {
      name?: string
      description?: string | null
      isPublic?: boolean
      region?: string | null
      subRegion?: string | null
      imageUrl?: string | null
      updatedAt: Date
    } = {
      updatedAt: new Date(),
    }

    // 존재하는 키만 반영
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }
    if (body.isPublic !== undefined) updateData.isPublic = Boolean(body.isPublic)
    if (body.region !== undefined) updateData.region = body.region?.trim() || null
    if (body.subRegion !== undefined) updateData.subRegion = body.subRegion?.trim() || null
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl?.trim() || null

    // 이름 검증
    if (updateData.name !== undefined && !updateData.name) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NAME_REQUIRED, 400)
    }

    // 3) 업데이트 실행
    const updatedCommunity = await prisma.community.update({
      where: { clubId: id },
      data: updateData,
      select: {
        clubId: true,
        name: true,
        description: true,
        isPublic: true,
        region: true,
        subRegion: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

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
 * - 커뮤니티를 소프트 삭제합니다. 실제 삭제가 아닌 deletedAt 타임스탬프를 설정합니다.
 * - 권한: 팀장만 삭제 가능
 * - 파라미터
 *   - params.id: 삭제할 커뮤니티의 clubId(필수)
 *
 * 응답
 * - 200: { success: true, data: { message: string } }
 * - 404: { success: false, error: string }
 * - 500: { success: false, error: string }
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
    const existingCommunity = await prisma.community.findFirst({
      where: { clubId: id, deletedAt: null },
      select: { clubId: true },
    })

    if (!existingCommunity) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    // 팀장 권한 확인
    const hasAdminPermission = await hasPermission(userId, id, 'admin')
    if (!hasAdminPermission) {
      return createErrorResponse('팀장만 커뮤니티를 삭제할 수 있습니다.', 403)
    }

    // 소프트 삭제 수행 (race condition 방지: where에 deletedAt 조건 포함)
    await prisma.community.update({
      where: {
        clubId: id,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    })

    return createSuccessResponse({ message: 'Community deleted successfully' })
  } catch (err: unknown) {
    console.error('Error deleting community:', err)

    // Prisma P2025: Record not found
    if (hasErrorCode(err, 'P2025')) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    return createErrorResponse(getErrorMessage(err, MESSAGES.ERROR.FAILED_TO_DELETE_COMMUNITY), 500)
  }
}
