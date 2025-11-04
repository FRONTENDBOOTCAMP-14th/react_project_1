import { fetchAllCommunities } from '@/app/api/communities/communities'
import { ErrorBoundary } from '@/components/common'
import CommunitiesClient from './_components/CommunitiesClient'

export default async function CommunitiesPage() {
  // 서버에서 데이터 페칭
  const communities = await fetchAllCommunities(100)

  return (
    <ErrorBoundary fallback={<div>커뮤니티를 불러올 수 없습니다.</div>}>
      <CommunitiesClient communities={communities} />
    </ErrorBoundary>
  )
}
