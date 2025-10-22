'use client'

import { useState, useEffect } from 'react'
import styles from './CalendarSection.module.css'

interface DayInfo {
  date: number
  day: string
  count: number
}

interface CalendarSectionProps {
  onDateSelect: (date: number) => void
}

export default function CalendarSection({ onDateSelect }: CalendarSectionProps) {
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate())
  const [days, setDays] = useState<DayInfo[]>([])

  useEffect(() => {
    // 클라이언트에서만 실행되어 hydration error 방지
    const today = new Date()
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const generatedDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      return {
        date: date.getDate(),
        day: dayNames[date.getDay()],
        count: Math.floor(Math.random() * 5), // 랜덤값(추후 삭제)
      }
    })

    setDays(generatedDays)
  }, []) // 의존성 배열 비움 - 한 번만 실행

  const handleDateClick = (date: number) => {
    setSelectedDate(date)
    onDateSelect(date)
  }

  return (
    <div className={styles['calendar-container']}>
      {days.map((d, i) => (
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
      ))}
    </div>
  )
}
