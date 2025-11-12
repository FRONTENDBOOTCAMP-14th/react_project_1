/**
 * Next.js Sitemap 생성
 * robots.txt에서 공개를 허용한 경로만 포함
 */

import prisma from '@/lib/prisma'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 공개 커뮤니티 목록 조회
  const publicCommunities = await prisma.community.findMany({
    where: {
      isPublic: true,
      deletedAt: null,
    },
    select: {
      clubId: true,
      updatedAt: true,
    },
  })

  // URL 설정 (환경변수 우선, 없으면 기본 도메인)
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://tokkinote.vercel.app')

  // 기본 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]

  // 공개 커뮤니티 상세 페이지들
  const communityPages: MetadataRoute.Sitemap = publicCommunities.map(community => ({
    url: `${baseUrl}/community/${community.clubId}`,
    lastModified: community.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...communityPages]
}
