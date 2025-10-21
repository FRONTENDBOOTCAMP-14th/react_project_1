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
 *
 * 요청 Body
 * {
 *   "role": "admin"  // owner, admin, member 중 하나
 * }
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = (await request.json()) as UpdateMemberRequest

    // 역할 검증
    if (body.role) {
      const validRoles = ['owner', 'admin', 'member']
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
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
