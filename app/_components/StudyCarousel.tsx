'use client'

import { useState, useEffect } from 'react'
import { Carousel, CarouselItem } from '@/components/ui'
import styles from './StudyCarousel.module.css'

interface StudyCarouselProps {
  selectedDate: number | null
}

export default function StudyCarousel({ selectedDate }: StudyCarouselProps) {
  const [itemsPerView, setItemsPerView] = useState(3)

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

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)

    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  if (!selectedDate) return null

  return (
    <div className={styles['carousel-container']}>
      <p>{selectedDate}일 스터디 목록</p>
      <Carousel showNavigation showIndicators itemsPerView={itemsPerView}>
        <CarouselItem>
          <div className={styles['carousel-item']}>스터디 A</div>
        </CarouselItem>
        <CarouselItem>
          <div className={styles['carousel-item']}>스터디 B</div>
        </CarouselItem>
        <CarouselItem>
          <div className={styles['carousel-item']}>스터디 C</div>
        </CarouselItem>
        <CarouselItem>
          <div className={styles['carousel-item']}>스터디 D</div>
        </CarouselItem>
      </Carousel>
    </div>
  )
}
