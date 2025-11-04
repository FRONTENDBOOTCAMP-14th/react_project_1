import { fetchAllCommunities } from '@/app/api/communities/communities'
import { MESSAGES } from '@/constants'
import { ErrorBoundary } from '@/components/common'
import CommunitiesClient from './_components/CommunitiesClient'

export default async function CommunitiesPage() {
  // 서버에서 데이터 페칭
  const communities = await fetchAllCommunities(100)

  return (
    <ErrorBoundary fallback={<div>{MESSAGES.ERROR.COMMUNITY_LOAD_FAILED}</div>}>
      <CommunitiesClient communities={communities} />
    </ErrorBoundary>
  )
}
