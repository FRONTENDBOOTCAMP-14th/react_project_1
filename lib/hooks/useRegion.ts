import { API_ENDPOINTS, MESSAGES } from '@/constants'
import type { Region } from '@/lib/types/common'
import { useCallback, useEffect, useState } from 'react'

export const useRegion = () => {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(API_ENDPOINTS.REGION.BASE)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: Region[] = await response.json()

      if (result) {
        setRegions(result)
      } else {
        setError(MESSAGES.ERROR.FAILED_TO_LOAD_REGIONS)
      }
    } catch (err) {
      console.error('Failed to fetch regions:', err)
      setError(MESSAGES.ERROR.FAILED_TO_LOAD_REGIONS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRegions()
  }, [fetchRegions])

  return {
    regions,
    loading,
    error,
    refetch: fetchRegions,
  }
}
