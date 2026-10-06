'use client'

import { Carousel, CarouselItem } from '@/components/ui'
import type { Community } from '@/lib/types/community'
import type { Round } from '@/lib/types/round'
import { formatDateRangeUTC, getServerTime, getUTCDayRange } from '@/lib/utils'
import { CheckCircle, Clock, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { useSyncExternalStore, useState } from 'react'
import { useSelectedDate } from '../_hooks/useSelectedDateContext'
import styles from './StudyCarousel.module.css'

const subscribeResize = (callback: () => void) => {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

const getItemsPerViewSnapshot = () => {
  const width = window.innerWidth
  if (width < 600) return 1
  if (width < 800) return 2
  return 3
}

const getServerItemsPerViewSnapshot = () => 3

interface StudyCarouselProps {
  userId?: string | null
  upcomingRounds: Round[]
  subscribedCommunities: Community[]
}

export default function StudyCarousel({
  userId,
  upcomingRounds,
  subscribedCommunities,
}: StudyCarouselProps) {
  const { selectedDate } = useSelectedDate()
  const [serverTime] = useState<Date>(() => getServerTime())

  const itemsPerView = useSyncExternalStore(
    subscribeResize,
    getItemsPerViewSnapshot,
    getServerItemsPerViewSnapshot
  )

  if (!selectedDate || !userId) return null

  const selectedDateRounds = (() => {
    if (!selectedDate) return []

    // UTC 기준으로 targetDate 생성
    const targetDate = new Date(serverTime)
    targetDate.setUTCDate(selectedDate)
    targetDate.setUTCHours(0, 0, 0, 0)

    // UTC 기준 하루 범위 (00:00:00 ~ 23:59:59.999)
    const { start: dayStart, end: dayEnd } = getUTCDayRange(targetDate)

    return upcomingRounds.filter(round => {
      if (!round.startDate) return false
      const roundDate = new Date(round.startDate)
      return roundDate >= dayStart && roundDate <= dayEnd
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

                  {round.startDate && round.endDate && (
                    <div className={styles['study-date']}>
                      {formatDateRangeUTC(round.startDate, round.endDate)}
                    </div>
                  )}

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
