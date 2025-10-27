import SearchForm from './_components/SearchForm'
import ProfileCard from './_components/ProfileCard'
import styles from './page.module.css'
import prisma from '@/lib/prisma'
import { memberDetailSelect, activeMemberWhere } from '@/lib/quaries'

interface MemberPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    search?: string
  }>
}

// Prisma 반환 타입
interface PrismaMember {
  id: string
  clubId: string
  userId: string
  role: string
  joinedAt: Date
  user: {
    userId: string
    username: string
    email: string | null
    nickname: string | null
  }
  community: {
    clubId: string
    name: string
    description: string | null
  }
}

// ProfileCard에 전달할 타입
interface Member {
  id: string
  clubId: string
  userId: string
  role: string
  joinedAt: string
  user: {
    userId: string
    username: string
    email: string
    nickname: string | null
  }
}

async function getMembers(clubId: string): Promise<Member[] | null> {
  try {
    const members = await prisma.communityMember.findMany({
      where: {
        ...activeMemberWhere,
        clubId,
      },
      select: memberDetailSelect,
      orderBy: { joinedAt: 'desc' },
    })

    // Prisma 타입을 ProfileCard 타입으로 변환
    return members.map((member: PrismaMember) => ({
      id: member.id,
      clubId: member.clubId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
      user: {
        userId: member.user.userId,
        username: member.user.username,
        email: member.user.email || '',
        nickname: member.user.nickname,
      },
    }))
  } catch (error) {
    console.error('Failed to fetch members:', error)
    return null
  }
}

export default async function MemberPage({ params, searchParams }: MemberPageProps) {
  const { id: clubId } = await params
  const { search } = await searchParams

  const members = await getMembers(clubId)

  if (!members) {
    return (
      <div className={styles.container}>
        <SearchForm placeholder="검색어를 입력해주세요" clubId={clubId} />
        <div className={styles.content}>
          <p className={styles['empty-message']}>멤버 목록을 불러오는데 실패했습니다.</p>
        </div>
      </div>
    )
  }

  // 검색어가 있으면 필터링
  const filteredMembers = search
    ? members.filter(
        member =>
          member.user.username.toLowerCase().includes(search.toLowerCase()) ||
          member.user.nickname?.toLowerCase().includes(search.toLowerCase())
      )
    : members

  return (
    <div className={styles.container}>
      <SearchForm placeholder="검색어를 입력해주세요" clubId={clubId} />
      <div className={styles.content}>
        {filteredMembers.length === 0 ? (
          <p className={styles['empty-message']}>
            {search ? '검색 결과가 없습니다.' : '멤버가 없습니다.'}
          </p>
        ) : (
          filteredMembers.map(member => <ProfileCard key={member.id} member={member} />)
        )}
      </div>
    </div>
  )
}
