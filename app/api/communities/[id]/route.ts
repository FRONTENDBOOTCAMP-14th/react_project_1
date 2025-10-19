/**
 * 커뮤니티 단건 API
 * - 경로: /api/communities/[id]
 * - 메서드: GET - 특정 커뮤니티 상세 조회
 */

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET /api/communities/[id]
 * - 특정 커뮤니티의 상세 정보를 조회합니다.
 * - 파라미터
 *   - params.id: 조회할 커뮤니티의 clubId(필수)
 *
 * 응답
 * - 200: { ok: true, data: Community }
 * - 404: { ok: false, error: 'Community not found' }
 * - 500: { ok: false, error: string }
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
        createdAt: true,
        tagname: true,
        deletedAt: true,
        _count: {
          select: {
            communityMembers: true,
          },
        },
      },
    })

    // 커뮤니티가 없거나 소프트 삭제된 경우
    if (!community || community.deletedAt !== null) {
      return NextResponse.json({ ok: false, error: 'Community not found' }, { status: 404 })
    }

    // deletedAt 필드 제거 후 응답
    const { deletedAt: _deletedAt, ...communityData } = community
    return NextResponse.json({ ok: true, data: communityData })
  } catch (err: unknown) {
    console.error('Error fetching community:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
