import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// 공백/빈문자 방지
function toStr(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t.length ? t : undefined
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const region = toStr(searchParams.get('region'))
    const subRegion = toStr(searchParams.get('subRegion'))
    const q = toStr(searchParams.get('q'))

    // UI에서 region 미선택 시 API 방어
    if (!region) {
      return new NextResponse('region is required', { status: 400 })
    }

    // 검색어를 공백 기준 토큰화
    const tokens = q
      ? q
          .split(/\s+/)
          .map(s => s.trim())
          .filter(Boolean)
      : []

    // Prisma 타입 안전 where
    const where: Prisma.CommunityWhereInput = {
      deletedAt: null, // 삭제된 커뮤니티 제외 (
      region,
      ...(subRegion && { subRegion }),
      ...(tokens.length > 0 && {
        // tagname: string[] (Postgres text[]) 기준
        tagname: { hasSome: tokens },
      }),
    }

    const communities = await prisma.community.findMany({
      where,
      select: {
        clubId: true,
        name: true,
        region: true,
        subRegion: true,
        tagname: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // 필요 시 페이지네이션 확장
    })

    // 클라이언트 SearchItem 형태로 normalize
    const items = communities.map(c => ({
      id: c.clubId,
      title: c.name,
      region: c.region ?? '',
      subRegion: c.subRegion ?? undefined,
      tags: c.tagname ?? [],
    }))

    return NextResponse.json({ items, total: items.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : '검색 요청 실패'
    return new NextResponse(message, { status: 500 })
  }
}
