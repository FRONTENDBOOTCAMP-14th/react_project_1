'use client'

import { Carousel, CarouselItem } from '@/components/ui'
import type { Community } from '@/lib/types/community'
import type { Round } from '@/lib/types/round'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './StudyCarousel.module.css'

interface StudyCarouselProps {
  selectedDate: number | null
  userId?: string | null
  upcomingRounds: Round[]
  subscribedCommunities: Community[]
}

export default function StudyCarousel({
  selectedDate,
  userId,
  upcomingRounds,
  subscribedCommunities,
}: StudyCarouselProps) {
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

  if (!selectedDate || !userId) return null

  // 선택된 날짜의 라운드들 필터링
  const selectedDateRounds = upcomingRounds.filter(round => {
    if (!round.startDate) return false
    const roundDate = new Date(round.startDate)
    const targetDate = new Date()
    targetDate.setDate(selectedDate)
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    const dayEnd = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate() + 1
    )
    return roundDate >= dayStart && roundDate < dayEnd
  })

  return (
    <div className={styles['carousel-container']}>
      <p>{selectedDate}일 스터디 목록</p>
      {selectedDateRounds.length === 0 ? (
        <p className={styles['carousel-none']}>{selectedDate}일에 예정된 스터디가 없습니다</p>
      ) : (
        <Carousel showNavigation showIndicators itemsPerView={itemsPerView}>
          {selectedDateRounds.map(round => {
            const community = subscribedCommunities.find(c => c.clubId === round.clubId)
            return (
              <CarouselItem key={round.roundId}>
                <Link className={styles['carousel-item']} href={`/community/${community?.clubId}`}>
                  <div className={styles['study-title']}>
                    {community?.name || '알 수 없는 커뮤니티'}
                  </div>
                  <div className={styles['study-info']}>{round.roundNumber} 회차</div>
                  {round.location && (
                    <div className={styles['study-location']}>
                      <MapPin size={16} /> {round.location}
                    </div>
                  )}
                </Link>
              </CarouselItem>
            )
          })}
        </Carousel>
      )}
    </div>
  )
}
