import { fetchAllCommunities } from '@/lib/community/communityServer'
import CommunitiesClient from './_components/CommunitiesClient'

export default async function CommunitiesPage() {
  // 서버에서 데이터 페칭
  const communities = await fetchAllCommunities(100)

  return <CommunitiesClient communities={communities} />
}
