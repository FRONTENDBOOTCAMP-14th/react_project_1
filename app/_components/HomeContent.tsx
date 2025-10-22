'use client'

import { useState } from 'react'
import CalendarSection from './CalendarSection'
import StudyCarousel from './StudyCarousel'
import RecommendedStudies from './RecommendedStudies'

export default function HomeContent() {
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate())

  return (
    <>
      <CalendarSection onDateSelect={setSelectedDate} />
      <StudyCarousel selectedDate={selectedDate} />
      <RecommendedStudies />
    </>
  )
}
