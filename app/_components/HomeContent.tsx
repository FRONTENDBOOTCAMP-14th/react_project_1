'use client'

import { useUserCommunities } from '@/lib/hooks'
import { SelectedDateProvider } from '../_hooks/useSelectedDateContext'
import CalendarSection from './CalendarSection'
import StudyCarousel from './StudyCarousel'

interface HomeContentProps {
  userId?: string | null
  children?: React.ReactNode
}

export default function HomeContent({ userId, children }: HomeContentProps) {
  // useUserCommunities 훅으로 사용자 데이터 한 번에 가져오기
  const { subscribedCommunities, upcomingRounds } = useUserCommunities(userId || '', {
    limit: 10, // 홈페이지에서는 10개로 제한
  })

  if (!userId) {
    return children
  }

  return (
    <SelectedDateProvider>
      <CalendarSection userId={userId} />
      <StudyCarousel
        userId={userId}
        upcomingRounds={upcomingRounds}
        subscribedCommunities={subscribedCommunities}
      />
      {children}
    </SelectedDateProvider>
  )
}
