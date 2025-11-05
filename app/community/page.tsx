import { fetchInitialCommunities } from '@/lib/community/cursorCommunityServer'
import type { Metadata } from 'next'
import CursorCommunitiesClient from './_components/CursorCommunitiesClient'

export const metadata: Metadata = {
  title: '커뮤니티 목록 | 토끼노트',
  description:
    '다양한 스터디 커뮤니티를 탐색하고 참여하세요. 지역별, 관심사별로 원하는 스터디를 찾아보세요.',
  openGraph: {
    title: '커뮤니티 목록 | 토끼노트',
    description: '다양한 스터디 커뮤니티를 탐색하고 참여하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function CommunitiesPage() {
  // 서버에서 초기 데이터 페칭 (커서 기반)
  const initialResult = await fetchInitialCommunities({ limit: 20 })

  return <CursorCommunitiesClient initialResult={initialResult} />
}
