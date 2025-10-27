'use client'

import { Carousel, CarouselItem } from '@/components/ui'
import type { Community } from '@/lib/types/community'
import type { Round } from '@/lib/types/round'
import { CheckCircle, Clock, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
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

  // useCallback으로 함수 메모이제이션 (불필요한 리스너 재등록 방지)
  const updateItemsPerView = useCallback(() => {
    const width = window.innerWidth
    if (width < 600) {
      setItemsPerView(1)
    } else if (width < 800) {
      setItemsPerView(2)
    } else {
      setItemsPerView(3)
    }
  }, [])

  useEffect(() => {
    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)

    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [updateItemsPerView])

  if (!selectedDate || !userId) return null

  const selectedDateRounds = (() => {
    if (!selectedDate) return []

    const targetDate = new Date()
    targetDate.setHours(0, 0, 0, 0)
    targetDate.setDate(selectedDate)

    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    const dayEnd = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate() + 1
    )

    return upcomingRounds.filter(round => {
      if (!round.startDate) return false
      const roundDate = new Date(round.startDate)
      return roundDate >= dayStart && roundDate < dayEnd
    })
  })()

  return (
    <div className={styles['carousel-container']}>
      <p>{selectedDate}일 스터디 목록</p>
      {selectedDateRounds.length === 0 ? (
        <p className={styles['carousel-none']}>{selectedDate}일에 예정된 스터디가 없습니다</p>
      ) : (
        <Carousel showNavigation showIndicators itemsPerView={itemsPerView}>
          {selectedDateRounds.map(round => {
            const community = subscribedCommunities.find(c => c.clubId === round.clubId)
            const attendeeCount = round._count?.attendance || 0
            const userAttendance = userId
              ? round.attendance?.find(att => att.userId === userId)
              : null
            const userStatus = userAttendance?.attendanceType

            return (
              <CarouselItem key={round.roundId}>
                <Link className={styles['carousel-item']} href={`/community/${community?.clubId}`}>
                  <div className={styles['study-title']}>
                    {community?.name || '알 수 없는 커뮤니티'}
                  </div>
                  <div className={styles['study-info']}>{round.roundNumber} 회차</div>

                  {/* 출석 정보 */}
                  <div className={styles['attendance-info']}>
                    <div className={styles['attendance-count']}>
                      <Users size={14} />
                      <span>{attendeeCount}명 참석</span>
                    </div>

                    {userId && userStatus && (
                      <div className={`${styles['user-status']} ${styles[`status-${userStatus}`]}`}>
                        {userStatus === 'present' && <CheckCircle size={14} />}
                        {userStatus === 'late' && <Clock size={14} />}
                        <span>
                          {userStatus === 'present' && '출석'}
                          {userStatus === 'late' && '지각'}
                          {userStatus === 'absent' && '결석'}
                          {userStatus === 'excused' && '양해'}
                        </span>
                      </div>
                    )}
                  </div>

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
