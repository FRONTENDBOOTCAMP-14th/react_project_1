import SearchForm from './_components/SearchForm'
import ProfileCard from './_components/ProfileCard'
import styles from './page.module.css'

interface MemberPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    search?: string
  }>
}

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

interface MembersResponse {
  success: boolean
  data: {
    data: Member[]
    count: number
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

async function getMembers(clubId: string, _search?: string): Promise<MembersResponse | null> {
  try {
    const searchParams = new URLSearchParams({
      clubId,
      limit: '50',
    })

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/members?${searchParams}`,
      {
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Failed to fetch members:', error)
    return null
  }
}

export default async function MemberPage({ params, searchParams }: MemberPageProps) {
  const { id: clubId } = await params
  const { search } = await searchParams

  const result = await getMembers(clubId, search)

  if (!result?.success) {
    return (
      <div className={styles.container}>
        <SearchForm placeholder="검색어를 입력해주세요" clubId={clubId} />
        <div className={styles.content}>
          <p className={styles['empty-message']}>멤버 목록을 불러오는데 실패했습니다.</p>
        </div>
      </div>
    )
  }

  // API 응답 구조: { success: true, data: { data: [], count, pagination } }
  const members = result.data.data

  // 검색어가 있으면 클라이언트 사이드 필터링
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
