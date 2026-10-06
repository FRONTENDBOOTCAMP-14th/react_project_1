import { API_ENDPOINTS, MESSAGES } from '@/constants'
import type { Region } from '@/lib/types/common'
import { useCallback } from 'react'
import { useAsyncData } from './useAsyncData'

export const useRegion = () => {
  const fetchRegions = useCallback(async (): Promise<Region[]> => {
    const response = await fetch(API_ENDPOINTS.REGION.BASE)
    if (!response.ok) {
      throw new Error(MESSAGES.ERROR.FAILED_TO_LOAD_REGIONS)
    }
    const result: Region[] = await response.json()
    if (!result) {
      throw new Error(MESSAGES.ERROR.FAILED_TO_LOAD_REGIONS)
    }
    return result
  }, [])

  const {
    data: regions,
    loading,
    error,
    refetch,
  } = useAsyncData(fetchRegions, {
    initialData: [] as Region[],
  })

  return {
    regions,
    loading,
    error,
    refetch,
  }
}
