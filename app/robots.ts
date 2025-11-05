import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tokkinote.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/community',
          '/community/*', // 커뮤니티 상세 페이지 허용
        ],
        disallow: [
          '/api/',
          '/login',
          '/profile',
          '/dashboard',
          '/_next/',
          '/static/',
          '/community/new',
          '/community/*/notification',
          '/community/member/',
          '/search?*', // 검색 쿼리 파라미터
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
