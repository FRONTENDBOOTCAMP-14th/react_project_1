import prisma from '@/lib/prisma'
import { memberDetailSelect } from '@/lib/queries'
import { MESSAGES } from '@/constants'
import MemberCard from './_components/MemberCard'
import ReactionForm from './_components/ReactionForm'
import ReactionList from './_components/ReactionList'
import styles from './page.module.css'
import type { Metadata } from 'next'

/**
 * 동적 Metadata 생성 - 멤버 프로필 SEO 최적화
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  const member =
    id.length > 35
      ? await prisma.communityMember.findFirst({
          where: {
            id,
            deletedAt: null,
          },
          select: {
            user: {
              select: {
                nickname: true,
                username: true,
              },
            },
            community: {
              select: {
                name: true,
              },
            },
          },
        })
      : null

  const title = member
    ? `${member.user.nickname || member.user.username} 프로필 | ${member.community.name} | 토끼노트`
    : '멤버 프로필 | 토끼노트'

  const description = member
    ? `${member.community.name} 커뮤니티의 ${member.user.nickname || member.user.username} 님의 프로필을 확인하세요.`
    : '커뮤니티 멤버의 프로필을 확인하세요.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      locale: 'ko_KR',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const member =
    id.length > 35
      ? await prisma.communityMember.findFirst({
          where: {
            id,
            deletedAt: null,
          },
          select: memberDetailSelect,
        })
      : null

  if (!member) {
    return <div className={styles.empty}>{MESSAGES.ERROR.MEMBER_NOT_FOUND}</div>
  }

  const attendanceCount = await prisma.attendance
    .findMany({
      where: {
        userId: member.user.userId,
        deletedAt: null,
      },
    })
    .then(attendance => attendance.length)

  return (
    <div className={styles.container}>
      <MemberCard
        nickname={member.user.nickname || ''}
        role={member.role}
        joinedAt={member.joinedAt}
        attendanceCount={attendanceCount}
      />
      <ReactionForm memberId={member.id} />
      <ReactionList memberId={member.id} />
    </div>
  )
}
