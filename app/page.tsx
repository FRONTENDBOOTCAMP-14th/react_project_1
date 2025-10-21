'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './page.module.css'
import { Carousel, CarouselItem } from '@/components/ui'

export default function HomePage() {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<number | null>(today.getDate())

  // 반응형 itemsPerView 상태
  const [itemsPerView, setItemsPerView] = useState(3)

  // 화면 크기에 따른 itemsPerView 계산
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth
      if (width < 600) {
        setItemsPerView(1)
      } else if (width < 800) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    // 초기 설정
    updateItemsPerView()

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', updateItemsPerView)

    // 정리 함수
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

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
          <Carousel showNavigation showIndicators itemsPerView={itemsPerView}>
            <CarouselItem>스터디 A</CarouselItem>
            <CarouselItem>스터디 B</CarouselItem>
            <CarouselItem>스터디 C</CarouselItem>
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
