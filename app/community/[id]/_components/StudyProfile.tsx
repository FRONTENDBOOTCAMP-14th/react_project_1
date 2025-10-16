'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import styles from './StudyProfile.module.css'
import type { Community } from '@/types/community'
import { MapPin, Users } from 'lucide-react'
import { useCommunityData } from '@/lib/hooks'
import { renderWithLoading, renderWithError } from '@/lib/utils'
import { LoadingState, ErrorState } from '@/components/common'

/**
 * StudyProfile 컴포넌트에 전달되는 속성
 */
interface StudyProfileProps {
  /** 커뮤니티 ID */
  id: string
}

/**
 * 커뮤니티 프로필 이미지 컴포넌트 (순수 컴포넌트)
 */
function ProfileImage({ alt, src = '/images/example.jpg' }: { alt: string; src?: string }) {
  return (
    <div className={styles['image-container']}>
      <Image
        src={src}
        alt={alt}
        width={90}
        height={90}
        className={styles.image}
        sizes="90px"
        priority
      />
    </div>
  )
}

/**
 * 정보 행 컴포넌트에 전달되는 속성
 */
interface InfoRowProps {
  /** 왼쪽 아이콘 */
  icon: ReactNode
  /** 텍스트 내용 */
  text: string
}

/**
 * 정보 행 컴포넌트 (순수 컴포넌트)
 */
function InfoRow({ icon, text }: InfoRowProps) {
  return (
    <section className={styles['info-row']} aria-label={text}>
      {icon}
      <p>{text}</p>
    </section>
  )
}

/**
 * 커뮤니티 정보 컴포넌트에 전달되는 속성
 */
interface ProfileInfoProps {
  /** 커뮤니티 데이터 */
  community: Community
}

/**
 * 커뮤니티 정보 컴포넌트 (순수 컴포넌트)
 */
function ProfileInfo({ community }: ProfileInfoProps) {
  return (
    <div className={styles['profile-info']}>
      <p className={styles['community-name']}>{community.name}</p>
      <InfoRow icon={<MapPin size={16} aria-hidden="true" />} text="종로구" />
      <InfoRow
        icon={<Users size={16} aria-hidden="true" />}
        text={`멤버: ${community._count?.communityMembers || 0}명`}
      />
    </div>
  )
}

/**
 * 커뮤니티 콘텐츠 컴포넌트에 전달되는 속성
 */
interface CommunityContentProps {
  /** 커뮤니티 데이터 */
  community: Community
}

/**
 * 커뮤니티 콘텐츠 컴포넌트 (순수 컴포넌트)
 */
function CommunityContent({ community }: CommunityContentProps) {
  return (
    <div className={styles['profile-wrapper']}>
      <article className={styles['profile-header']}>
        <ProfileImage alt={`${community.name} 커뮤니티 프로필 이미지`} />
        <ProfileInfo community={community} />
      </article>
      <p className={styles.description}>{community.description || '설명이 없습니다.'}</p>
    </div>
  )
}

/**
 * 커뮤니티 프로필 메인 컴포넌트
 * - 커스텀 훅으로 데이터 fetching/상태 관리
 * - 선언적 조건부 렌더링
 */
export default function StudyProfile({ id }: StudyProfileProps) {
  const { community, loading, error } = useCommunityData(id)

  return renderWithLoading(
    loading,
    <LoadingState message="커뮤니티 정보를 불러오는 중..." />,
    renderWithError(
      error,
      <ErrorState message={error || '커뮤니티를 찾을 수 없습니다.'} />,
      community ? (
        <CommunityContent community={community} />
      ) : (
        <ErrorState message="커뮤니티를 찾을 수 없습니다." />
      )
    )
  )
}
