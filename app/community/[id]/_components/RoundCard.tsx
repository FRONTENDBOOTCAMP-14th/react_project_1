'use client'

import { Checkbox, StrokeButton } from '@/components/ui'
import { useEffect, useState, useOptimistic, useTransition, useCallback } from 'react'
import type { StudyGoal } from '@/types/goal'
import type { Round } from '@/types/round'
import { toast } from 'sonner'
import styles from './RoundCard.module.css'

interface RoundCardProps {
  clubId: string
  isTeamLeader?: boolean
}

export default function RoundCard({ clubId, isTeamLeader }: RoundCardProps) {
  const [currentRound, setCurrentRound] = useState<Round | null>(null)

  useEffect(() => {
    const fetchCurrentRound = async () => {
      try {
        const response = await fetch(`/api/rounds?clubId=${clubId}`)
        const data = await response.json()
        if (data.success && data.data && data.data.length > 0) {
          setCurrentRound(data.data[0])
        }
      } catch (error) {
        console.error('Failed to fetch round:', error)
      }
    }

    fetchCurrentRound()
  }, [clubId])

  return (
    <article className={styles['round-card-wrapper']}>
      <RoundCardHeader round={currentRound} />
      <RoundCardBody clubId={clubId} roundId={currentRound?.roundId} isTeamLeader={isTeamLeader} />
    </article>
  )
}

interface RoundCardHeaderProps {
  round: Round | null
}

function RoundCardHeader({ round }: RoundCardHeaderProps) {
  return (
    <header>
      <p>{round ? `${round.roundNumber}회차` : '회차 정보 없음'}</p>
    </header>
  )
}

interface RoundCardBodyProps {
  clubId: string
  roundId?: string
  isTeamLeader?: boolean
}

interface GoalsState {
  team: StudyGoal[]
  personal: StudyGoal[]
}

interface OptimisticAction {
  type: 'team' | 'personal'
  goalId: string
  isComplete: boolean
}

function RoundCardBody({ clubId, isTeamLeader }: RoundCardBodyProps) {
  const [goals, setGoals] = useState<GoalsState>({ team: [], personal: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // useOptimistic: 팀/개인 목표 통합 관리
  const [optimisticGoals, setOptimisticGoals] = useOptimistic<GoalsState, OptimisticAction>(
    goals,
    (state, { type, goalId, isComplete }) => ({
      ...state,
      [type]: state[type].map(goal => (goal.goalId === goalId ? { ...goal, isComplete } : goal)),
    })
  )

  // 목표 조회: Promise.all로 병렬 호출 최적화
  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 병렬 호출로 성능 개선
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

  const handleToggleComplete = async (goalId: string, isComplete: boolean, isTeam: boolean) => {
    const type = isTeam ? 'team' : 'personal'

    // 낙관적 업데이트
    startTransition(() => {
      setOptimisticGoals({ type, goalId, isComplete })
    })

    try {
      toast.loading('목표를 업데이트 중입니다...')
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isComplete }),
      })

      const data = await response.json()

      if (!data.success) {
        console.error('Failed to update goal:', data.error)
        await fetchGoals()
        return
      }

      // 성공 시: 실제 상태 동기화
      setGoals(prev => ({
        ...prev,
        [type]: prev[type].map(goal => (goal.goalId === goalId ? { ...goal, isComplete } : goal)),
      }))
      toast.dismiss()
      toast.success('목표를 업데이트했습니다.')
    } catch (err) {
      console.error('Failed to toggle complete:', err)
      await fetchGoals()
      toast.dismiss()
      toast.error('목표를 업데이트하는데 실패했습니다.')
    }
  }

  const handleAddGoal = () => {
    console.log('Add goal clicked')
  }

  if (loading) {
    return (
      <section>
        <p>목표를 불러오는 중...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}
      >
        <p className="error">{error}</p>
        <StrokeButton onClick={fetchGoals} type="button">
          다시 시도
        </StrokeButton>
      </section>
    )
  }

  return (
    <section style={{ width: '100%', gap: '1rem' }}>
      <div className={styles['goals-container']}>
        <div className={styles['goals-header']}>
          <p>그룹목표</p>
        </div>
        {isTeamLeader ? (
          <StrokeButton className={styles['add-button']} onClick={handleAddGoal} type="button">
            +
          </StrokeButton>
        ) : null}
        <div className={styles['goals-list']}>
          {optimisticGoals.team.length > 0 ? (
            optimisticGoals.team.map(goal => (
              <div key={goal.goalId} className={styles['goal-card']}>
                <Checkbox
                  checked={goal.isComplete}
                  onChange={() => handleToggleComplete(goal.goalId, !goal.isComplete, true)}
                  aria-label={`${goal.title} 완료 표시`}
                />
                <p>{goal.title}</p>
              </div>
            ))
          ) : (
            <p className={styles['goal-card']}>그룹목표가 없습니다.</p>
          )}
        </div>
      </div>

      <div className={styles['goals-container']}>
        <div className={styles['goals-header']}>
          <p>개인목표</p>
        </div>
        <StrokeButton className={styles['add-button']} onClick={handleAddGoal} type="button">
          +
        </StrokeButton>
        <div className={styles['goals-list']}>
          {optimisticGoals.personal.length > 0 ? (
            optimisticGoals.personal.map(goal => (
              <div key={goal.goalId} className={styles['goal-card']}>
                <Checkbox
                  checked={goal.isComplete}
                  onChange={() => handleToggleComplete(goal.goalId, !goal.isComplete, false)}
                  aria-label={`${goal.title} 완료 표시`}
                />
                <p>{goal.title}</p>
              </div>
            ))
          ) : (
            <p className={styles['goal-card']}>개인목표가 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  )
}
