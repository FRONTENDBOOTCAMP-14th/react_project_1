import { useEffect, useState, useCallback } from 'react'
import type { StudyGoal } from '@/types/goal'

interface GoalsState {
  team: StudyGoal[]
  personal: StudyGoal[]
}

interface UseGoalsDataResult {
  goals: GoalsState
  setGoals: React.Dispatch<React.SetStateAction<GoalsState>>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * 목표 데이터를 병렬로 가져오는 커스텀 훅
 * @param clubId - 클럽 ID
 * @returns 목표 데이터, 상태 업데이트 함수, 로딩 상태, 에러, 재조회 함수
 */
export const useGoalsData = (clubId: string): UseGoalsDataResult => {
  const [goals, setGoals] = useState<GoalsState>({ team: [], personal: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 병렬 호출로 성능 최적화
      const [teamResponse, personalResponse] = await Promise.all([
        fetch(`/api/goals?clubId=${clubId}&isTeam=true`),
        fetch(`/api/goals?clubId=${clubId}&isTeam=false`),
      ])

      const [teamData, personalData] = await Promise.all([
        teamResponse.json(),
        personalResponse.json(),
      ])

      setGoals({
        team: teamData.success ? teamData.data || [] : [],
        personal: personalData.success ? personalData.data || [] : [],
      })
    } catch (err) {
      console.error('Failed to fetch goals:', err)
      setError('목표를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [clubId])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  return { goals, setGoals, loading, error, refetch: fetchGoals }
}
