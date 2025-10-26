'use client'

import { useState } from 'react'
import CalendarSection from './CalendarSection'
import StudyCarousel from './StudyCarousel'
import RecommendedStudies from './RecommendedStudies'
import type { CommunityInfo } from '@/lib/types'

interface HomeContentProps {
  userId?: string | null
  filteredCommunities?: CommunityInfo[]
}

export default function HomeContent({ userId, filteredCommunities }: HomeContentProps) {
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate())

  if (!userId) {
    return <RecommendedStudies />
  }

  return (
    <>
      <CalendarSection onDateSelect={setSelectedDate} />
      <StudyCarousel
        selectedDate={selectedDate}
        userId={userId}
        filteredCommunities={filteredCommunities}
      />
      <RecommendedStudies />
    </>
  )
}
