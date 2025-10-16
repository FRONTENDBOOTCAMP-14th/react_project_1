'use client'

import { Checkbox, StrokeButton } from '@/components/ui'
import { useEffect, useState } from 'react'
import type { StudyGoal } from '@/types/goal'
import styles from './RoundCard.module.css'

interface RoundCardProps {
  clubId: string
  isTeamLeader?: boolean
}

export default function RoundCard({ clubId, isTeamLeader }: RoundCardProps) {
  return (
    <article className={styles['round-card-wrapper']}>
      <RoundCardHeader />
      <RoundCardBody clubId={clubId} isTeamLeader={isTeamLeader} />
    </article>
  )
}

function RoundCardHeader() {
  return (
    <header>
      <p>4회차</p>
    </header>
  )
}

interface RoundCardBodyProps {
  clubId: string
  isTeamLeader?: boolean
}

function RoundCardBody({ clubId, isTeamLeader }: RoundCardBodyProps) {
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
  }, [clubId])

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
        <div style={{ display: 'flex', gap: '1rem', padding: '1rem', flexDirection: 'column' }}>
          {teamGoals.map(goal => (
            <div key={goal.goalId} className={styles['goal-card']}>
              <Checkbox />
              <p>{goal.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles['goals-container']}>
        <p>개인목표</p>
        <StrokeButton className={styles['add-button-with-margin']}>+</StrokeButton>
        <div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
          {personalGoals.map(goal => (
            <div key={goal.goalId} className={styles['goal-card']}>
              <Checkbox />
              <p>{goal.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
