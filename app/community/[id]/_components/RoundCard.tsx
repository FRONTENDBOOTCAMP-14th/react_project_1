'use client'

import { StrokeButton } from '@/components/ui'
import { useEffect, useState } from 'react'
import type { StudyGoal } from '@/types/goal'

interface RoundCardProps {
  clubId: string
  isTeamLeader?: boolean
}

export default function RoundCard({ clubId, isTeamLeader }: RoundCardProps) {
  return (
    <article>
      <RoundCardHeader />
      <RoundCardBody clubId={clubId} isTeamLeader={isTeamLeader} />
    </article>
  )
}

function RoundCardHeader() {
  return (
    <header>
      <p>RoundCardHeader</p>
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
        <p style={{ color: 'red' }}>{error}</p>
      </section>
    )
  }

  return (
    <section>
      <div style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p>그룹목표</p>
          {teamGoals.length === 0 && isTeamLeader ? (
            <StrokeButton style={{ fontSize: '1.5rem', padding: '0.25rem' }}>+</StrokeButton>
          ) : null}
        </div>
        {teamGoals.map(goal => (
          <div
            key={goal.goalId}
            style={{
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              marginBottom: '0.5rem',
            }}
          >
            <h3>{goal.title}</h3>
            <p style={{ fontSize: '0.875rem' }}>{goal.description}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '50%', marginTop: '1.5rem' }}>
        <p>개인목표</p>
        <StrokeButton style={{ fontSize: '1.5rem', padding: '0.25rem', marginBottom: '0.5rem' }}>
          +
        </StrokeButton>
        {personalGoals.map(goal => (
          <div
            key={goal.goalId}
            style={{
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              marginBottom: '0.5rem',
            }}
          >
            <h4>{goal.title}</h4>
            <p style={{ fontSize: '0.875rem' }}>{goal.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
