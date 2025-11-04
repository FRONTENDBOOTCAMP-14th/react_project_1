'use client'

import { LoadingState } from '@/components/common'
import { useUserCommunities } from '@/lib/hooks'
import { useMemo, useState } from 'react'
import styles from './CalendarSection.module.css'
import { toLocalTime } from '@/lib/utils'

interface CalendarSectionProps {
  onDateSelect: (date: number) => void
  userId?: string | null
}

export default function CalendarSection({ onDateSelect, userId }: CalendarSectionProps) {
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate())

  // useUserCommunities 훅 사용 (userId가 있을 때만)
  const { upcomingRounds, loading } = useUserCommunities(userId || '')

  // useMemo로 days 계산 최적화 (매 렌더링마다 재계산 방지)
  const days = useMemo(() => {
    const today = new Date()
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    return Array.from({ length: 3 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // 해당 날짜의 라운드 수 계산
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

      // 해당 날짜의 라운드들
      const dayRounds = upcomingRounds.filter(round => {
        if (!round.startDate) return false
        const roundDate = toLocalTime(new Date(round.startDate))
        return roundDate >= dayStart && roundDate < dayEnd
      })

      // 출석자 수 계산 (중복 제거)
      const attendeeCount = dayRounds.reduce((total, round) => {
        return total + (round._count?.attendance || 0)
      }, 0)

      // 사용자의 출석 상태 확인
      const userAttendance = userId
        ? dayRounds.find(round => round.attendance?.some(att => att.userId === userId))
        : null
      const userAttendanceStatus = userAttendance?.attendance?.find(
        att => att.userId === userId
      )?.attendanceType

      return {
        date: date.getDate(),
        day: dayNames[date.getDay()],
        count: dayRounds.length,
        attendeeCount,
        userAttendanceStatus: userAttendanceStatus as
          | 'present'
          | 'absent'
          | 'late'
          | 'excused'
          | null,
      }
    })
  }, [upcomingRounds, userId]) // upcomingRounds와 userId가 변경될 때만 재계산

  const handleDateClick = (date: number) => {
    setSelectedDate(date)
    onDateSelect(date)
  }

  return (
    <div className={styles['calendar-container']}>
      {loading ? (
        <LoadingState />
      ) : (
        days.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleDateClick(d.date)}
            className={`${styles['day-box']} ${selectedDate === d.date ? styles['selected-day'] : ''}`}
          >
            <div className={styles['date']}>{d.date}</div>
            <div className={styles['day']}>{d.day}</div>
            <div className={styles['count-box']}>{d.count}</div>
          </button>
        ))
      )}
    </div>
  )
}
