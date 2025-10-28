/**
 * 커뮤니티 멤버(CommunityMember) 단건 API
 * - 경로: /api/members/[id]
 * - 메서드:
 *   - GET: 특정 멤버 상세 조회
 *   - PATCH: 특정 멤버 역할 수정
 *   - DELETE: 특정 멤버 소프트 삭제 (탈퇴)
 */

import prisma from '@/lib/prisma'
import { memberSelect, memberDetailSelect } from '@/lib/quaries'
import type { UpdateMemberRequest } from '@/lib/types/member'
import type { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import { MESSAGES } from '@/constants/messages'
import { hasErrorCode } from '@/lib/errors'
import { requireAuthUser } from '@/lib/utils/api-auth'
import { hasPermission } from '@/lib/auth'

/**
 * GET /api/members/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // findFirst로 소프트 삭제 조건 적용
    const member = await prisma.communityMember.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: memberDetailSelect,
    })

    if (!member) {
      return createErrorResponse(MESSAGES.ERROR.MEMBER_NOT_FOUND, 404)
    }

    return createSuccessResponse(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to fetch member: ${message}`, 500)
  }
}

/**
 * PATCH /api/members/[id]
 * - 멤버 역할을 수정합니다.
 * - 권한: 팀장만 수정 가능
 *
 * 요청 Body
 * {
 *   "role": "admin"  // admin, member 중 하나
 * }
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    // 멤버 정보 조회
    const existingMember = await prisma.communityMember.findFirst({
      where: { id, deletedAt: null },
      select: { clubId: true, userId: true },
    })

    if (!existingMember) {
      return createErrorResponse(MESSAGES.ERROR.MEMBER_NOT_FOUND, 404)
    }

    // 팀장 권한 확인
    const hasAdminPermission = await hasPermission(userId, existingMember.clubId, 'admin')
    if (!hasAdminPermission) {
      return createErrorResponse('팀장만 멤버 역할을 수정할 수 있습니다.', 403)
    }

    const body = (await request.json()) as UpdateMemberRequest

    // 역할 검증
    if (body.role) {
      const validRoles = ['admin', 'member']
      if (!validRoles.includes(body.role)) {
        return createErrorResponse(MESSAGES.ERROR.INVALID_ROLE, 400)
      }
    }

    // 동적 업데이트 데이터 구성
    const updateData: {
      role?: string
      updatedAt?: Date
    } = {}

    if (body.role !== undefined) {
      updateData.role = body.role
    }

    // 업데이트 실행 (race condition 방지: where에 deletedAt 조건 포함)
    try {
      const updatedMember = await prisma.communityMember.update({
        where: {
          id,
          deletedAt: null,
        },
        data: updateData,
        select: memberSelect,
      })

      return createSuccessResponse(updatedMember)
    } catch (error: unknown) {
      // Prisma P2025: Record not found
      if (hasErrorCode(error, 'P2025')) {
        return createErrorResponse(MESSAGES.ERROR.MEMBER_NOT_FOUND, 404)
      }
      throw error
    }
  } catch (error) {
    console.error('Error updating member:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_UPDATE_MEMBER, 500)
  }
}

/**
 * DELETE /api/members/[id]
 * - 멤버를 소프트 삭제합니다 (커뮤니티 탈퇴).
 * - 권한: 본인 또는 팀장
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

    // 멤버 정보 조회
    const existingMember = await prisma.communityMember.findFirst({
      where: { id, deletedAt: null },
      select: { clubId: true, userId: true },
    })

    if (!existingMember) {
      return createErrorResponse(MESSAGES.ERROR.MEMBER_NOT_FOUND, 404)
    }

    // 권한 확인: 본인 또는 팀장
    const isSelf = existingMember.userId === userId
    const hasAdminPermission = await hasPermission(userId, existingMember.clubId, 'admin')
    if (!isSelf && !hasAdminPermission) {
      return createErrorResponse('본인 또는 팀장만 멤버를 삭제할 수 있습니다.', 403)
    }

    // 소프트 삭제 수행 (race condition 방지: where에 deletedAt 조건 포함)
    try {
      await prisma.communityMember.update({
        where: {
          id,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      })

      return createSuccessResponse({ message: 'Member deleted successfully' })
    } catch (error: unknown) {
      // Prisma P2025: Record not found
      if (hasErrorCode(error, 'P2025')) {
        return createErrorResponse(MESSAGES.ERROR.MEMBER_NOT_FOUND, 404)
      }
      throw error
    }
  } catch (error) {
    console.error('Error deleting member:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_DELETE_MEMBER, 500)
  }
}
