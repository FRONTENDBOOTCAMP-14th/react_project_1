'use client'

import { Checkbox, StrokeButton } from '@/components/ui'
import { useEffect, useState } from 'react'
import type { StudyGoal } from '@/types/goal'
import type { Round } from '@/types/round'
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

function RoundCardBody({ clubId, roundId, isTeamLeader }: RoundCardBodyProps) {
  const [teamGoals, setTeamGoals] = useState<StudyGoal[]>([])
  const [personalGoals, setPersonalGoals] = useState<StudyGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true)
        setError(null)

        // 팀 목표 조회 (isTeam=true, clubId)
        const teamResponse = await fetch(`/api/goals?clubId=${clubId}&isTeam=true`)
        const teamData = await teamResponse.json()

        // 개인 목표 조회 (isTeam=false, clubId)
        const personalResponse = await fetch(`/api/goals?clubId=${clubId}&isTeam=false`)
        const personalData = await personalResponse.json()

        if (teamData.success) {
          setTeamGoals(teamData.data || [])
        }

        if (personalData.success) {
          setPersonalGoals(personalData.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch goals:', err)
        setError('목표를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [clubId, roundId])

  const handleToggleComplete = async (goalId: string, isComplete: boolean) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isComplete }),
      })

      const data = await response.json()

      if (data.success) {
        // 로컬 상태 업데이트
        setTeamGoals(prev =>
          prev.map(goal => (goal.goalId === goalId ? { ...goal, isComplete } : goal))
        )
        setPersonalGoals(prev =>
          prev.map(goal => (goal.goalId === goalId ? { ...goal, isComplete } : goal))
        )
      } else {
        console.error('Failed to update goal:', data.error)
      }
    } catch (err) {
      console.error('Failed to toggle complete:', err)
    }
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
      <section>
        <p className="error">{error}</p>
      </section>
    )
  }

  return (
    <section style={{ width: '100%', gap: '1rem' }}>
      <div className={styles['goals-container']}>
        <div className={styles['goals-header']}>
          <p>그룹목표</p>
          {teamGoals.length === 0 && isTeamLeader ? (
            <StrokeButton className={styles['add-button']}>+</StrokeButton>
          ) : null}
        </div>
        <div className={styles['goals-list']}>
          {teamGoals.map(goal => (
            <div key={goal.goalId} className={styles['goal-card']}>
              <Checkbox
                checked={goal.isComplete}
                onChange={() => handleToggleComplete(goal.goalId, !goal.isComplete)}
              />
              <p>{goal.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles['goals-container']}>
        <p>개인목표</p>
        <StrokeButton className={styles['add-button-with-margin']}>+</StrokeButton>
        <div className={styles['goals-list-row']}>
          {personalGoals.map(goal => (
            <div key={goal.goalId} className={styles['goal-card']}>
              <Checkbox
                checked={goal.isComplete}
                onChange={() => handleToggleComplete(goal.goalId, !goal.isComplete)}
              />
              <p>{goal.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
