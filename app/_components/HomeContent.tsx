'use client'

import { useState } from 'react'
import { useUserCommunities } from '@/lib/hooks'
import CalendarSection from './CalendarSection'
import RecommendedStudies from './RecommendedStudies'
import StudyCarousel from './StudyCarousel'

interface HomeContentProps {
  userId?: string | null
}

export default function HomeContent({ userId }: HomeContentProps) {
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate())

  // useUserCommunities 훅으로 사용자 데이터 한 번에 가져오기
  const { subscribedCommunities, upcomingRounds } = useUserCommunities(userId || '')

  if (!userId) {
    return <RecommendedStudies />
  }

  return (
    <>
      <CalendarSection onDateSelect={setSelectedDate} userId={userId} />
      <StudyCarousel
        selectedDate={selectedDate}
        userId={userId}
        upcomingRounds={upcomingRounds}
        subscribedCommunities={subscribedCommunities}
      />
      <RecommendedStudies />
    </>
  )
}
