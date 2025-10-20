'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './page.module.css'

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null)

  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const dayName = dayNames[date.getDay()]

    return {
      date: date.getDate(),
      day: dayName,
      count: Math.floor(Math.random() * 5), // 랜덤값(추후 삭제)
    }
  })

  return (
    <main className={styles.main}>
      <div className={styles.logoContainer}>
        <Image src="/svg/logo.svg" alt="Study Club Tracker 로고" width={40} height={40} priority />
      </div>

      <div className={styles.calendarContainer}>
        {days.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelectedDate(d.date)}
            className={`${styles.dayBox} ${selectedDate === d.date ? styles.selectedDay : ''}`}
          >
            <div className={styles.date}>{d.date}</div>
            <div className={styles.day}>{d.day}</div>
            <div className={styles.countBox}>{d.count}</div>
          </button>
        ))}
      </div>
      {selectedDate && (
        <div className={styles.carouselContainer}>
          <p>{selectedDate}일 스터디 목록</p>
          <div className={styles.carousel}>
            <div className={styles.carouselItem}>스터디 A</div>
            <div className={styles.carouselItem}>스터디 B</div>
            <div className={styles.carouselItem}>스터디 C</div>
          </div>
        </div>
      )}
      <div className={styles.footerContainer}>
        <h2>추천 스터디</h2>
        <div className={styles.recommendContainer}>
          <div className={styles.recommendItem}>스터디 A</div>
          <div className={styles.recommendItem}>스터디 B</div>
          <div className={styles.recommendItem}>스터디 C</div>
        </div>
      </div>
    </main>
  )
}
