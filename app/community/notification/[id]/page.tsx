import { checkisAdmin, getCurrentUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'
import type { Metadata } from 'next'
import NotificationContainer from './_components/NotificationContainer'

/**
 * 동적 Metadata 생성 - 공지사항 페이지 SEO 최적화
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id: clubId } = await params

  const community = await prisma.community.findFirst({
    where: { clubId, deletedAt: null },
    select: { name: true },
  })

  const title = community ? `${community.name} 공지사항 | 토끼노트` : '공지사항 | 토끼노트'

  const description = community
    ? `${community.name} 커뮤니티의 공지사항을 확인하세요.`
    : '커뮤니티 공지사항을 확인하세요.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ko_KR',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function NotificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params
  const userId = await getCurrentUserId()
  const isAdmin = await checkisAdmin(userId, clubId)
  return <NotificationContainer clubId={clubId} userId={userId || ''} isAdmin={isAdmin} />
}
