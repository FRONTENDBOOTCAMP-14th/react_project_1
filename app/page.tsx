'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './page.module.css'
import { Carousel, CarouselItem } from '@/components/ui'

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
      <div className={styles['logo-container']}>
        <Image src="/svg/logo.svg" alt="Study Club Tracker 로고" width={40} height={40} priority />
      </div>

      <div className={styles['calendar-container']}>
        {days.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelectedDate(d.date)}
            className={`${styles['day-box']} ${selectedDate === d.date ? styles['selected-day'] : ''}`}
          >
            <div className={styles['date']}>{d.date}</div>
            <div className={styles['day']}>{d.day}</div>
            <div className={styles['count-box']}>{d.count}</div>
          </button>
        ))}
      </div>
      {selectedDate && (
        <div className={styles['carousel-container']}>
          <p>{selectedDate}일 스터디 목록</p>
          <Carousel showNavigation showIndicators virtualScroll itemsPerView={3}>
            <CarouselItem>스터디 A</CarouselItem>
            <CarouselItem>스터디 B</CarouselItem>
            <CarouselItem>스터디 C</CarouselItem>
            <CarouselItem>스터디 D</CarouselItem>
            <CarouselItem>스터디 E</CarouselItem>
            <CarouselItem>스터디 F</CarouselItem>
            <CarouselItem>스터디 G</CarouselItem>
            <CarouselItem>스터디 H</CarouselItem>
            <CarouselItem>스터디 I</CarouselItem>
            <CarouselItem>스터디 J</CarouselItem>
            <CarouselItem>스터디 K</CarouselItem>
            <CarouselItem>스터디 L</CarouselItem>
            <CarouselItem>스터디 M</CarouselItem>
            <CarouselItem>스터디 N</CarouselItem>
            <CarouselItem>스터디 O</CarouselItem>
            <CarouselItem>스터디 P</CarouselItem>
            <CarouselItem>스터디 Q</CarouselItem>
            <CarouselItem>스터디 R</CarouselItem>
            <CarouselItem>스터디 S</CarouselItem>
            <CarouselItem>스터디 T</CarouselItem>
            <CarouselItem>스터디 U</CarouselItem>
            <CarouselItem>스터디 V</CarouselItem>
            <CarouselItem>스터디 W</CarouselItem>
            <CarouselItem>스터디 X</CarouselItem>
            <CarouselItem>스터디 Y</CarouselItem>
            <CarouselItem>스터디 Z</CarouselItem>
            <CarouselItem>스터디 AA</CarouselItem>
            <CarouselItem>스터디 AB</CarouselItem>
            <CarouselItem>스터디 AC</CarouselItem>
            <CarouselItem>스터디 AD</CarouselItem>
            <CarouselItem>스터디 AE</CarouselItem>
            <CarouselItem>스터디 AF</CarouselItem>
            <CarouselItem>스터디 AG</CarouselItem>
            <CarouselItem>스터디 AH</CarouselItem>
            <CarouselItem>스터디 AI</CarouselItem>
            <CarouselItem>스터디 AJ</CarouselItem>
            <CarouselItem>스터디 AK</CarouselItem>
            <CarouselItem>스터디 AL</CarouselItem>
            <CarouselItem>스터디 AM</CarouselItem>
            <CarouselItem>스터디 AN</CarouselItem>
            <CarouselItem>스터디 AO</CarouselItem>
            <CarouselItem>스터디 AP</CarouselItem>
            <CarouselItem>스터디 AQ</CarouselItem>
            <CarouselItem>스터디 AR</CarouselItem>
            <CarouselItem>스터디 AS</CarouselItem>
            <CarouselItem>스터디 AT</CarouselItem>
            <CarouselItem>스터디 AU</CarouselItem>
            <CarouselItem>스터디 AV</CarouselItem>
            <CarouselItem>스터디 AW</CarouselItem>
            <CarouselItem>스터디 AX</CarouselItem>
            <CarouselItem>스터디 AY</CarouselItem>
            <CarouselItem>스터디 AZ</CarouselItem>
          </Carousel>
        </div>
      )}
      <div className={styles['footer-container']}>
        <h2>추천 스터디</h2>
        <div className={styles['recommend-container']}>
          <div className={styles['recommend-item']}>스터디 A</div>
          <div className={styles['recommend-item']}>스터디 B</div>
          <div className={styles['recommend-item']}>스터디 C</div>
        </div>
      </div>
    </main>
  )
}
