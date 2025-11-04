import { API_ENDPOINTS } from '@/constants'
import type { Region } from '@/lib/types/common'
import { fetcher } from '@/lib/utils/swr'
import useSWR from 'swr'

interface UseRegionResult {
  regions: Region[]
  loading: boolean
  error: Error | undefined
  refetch: () => Promise<void>
}

/**
 * 지역 데이터를 가져오는 SWR 기반 커스텀 훅
 * @returns 지역 목록, 로딩 상태, 에러, 재조회 함수
 *
 * @example
 * ```tsx
 * const { regions, loading, error, refetch } = useRegion()
 *
 * if (loading) return <div>Loading...</div>
 * if (error) return <div>Error: {error.message}</div>
 *
 * return (
 *   <select>
 *     {regions.map(region => (
 *       <option key={region.id} value={region.id}>
 *         {region.name}
 *       </option>
 *     ))}
 *   </select>
 * )
 * ```
 */
export const useRegion = (): UseRegionResult => {
  const { data, error, isLoading } = useSWR<Region[]>(API_ENDPOINTS.REGION.BASE, fetcher)

  // 재조회 함수
  const refetch = async () => {
    // SWR의 mutate를 사용하여 캐시 무효화 및 재조회
    const { mutate } = await import('swr')
    await mutate(API_ENDPOINTS.REGION.BASE)
  }

  return {
    regions: data || [],
    loading: isLoading,
    error,
    refetch,
  }
}
