'use client'

import Image from 'next/image'
import { memo } from 'react'
import type { ReactNode } from 'react'
import styles from './StudyProfile.module.css'
import type { Community } from '@/lib/types/community'
import { Ellipsis, MapPin, Users } from 'lucide-react'
import { useCommunity } from '@/lib/hooks'
import { renderWithLoading, renderWithError } from '@/lib/utils'
import { LoadingState, ErrorState } from '@/components/common'
import { UI_CONSTANTS, MESSAGES, ROUTES } from '@/constants'
import { StrokeButton, Popover, type PopoverAction, IconLink } from '@/components/ui'

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
const ProfileImage = memo(({ alt, src = '/images/example.jpg' }: { alt: string; src?: string }) => {
  const size = UI_CONSTANTS.IMAGE_SIZE.PROFILE_THUMBNAIL

  return (
    <div className={styles['image-container']}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={styles.image}
        sizes={`${size}px`}
        priority
      />
    </div>
  )
})

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
const InfoRow = memo(({ icon, text }: InfoRowProps) => {
  return (
    <section className={styles['info-row']} aria-label={text}>
      {icon}
      <p>{text}</p>
    </section>
  )
})

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
const ProfileInfo = memo(({ community }: ProfileInfoProps) => {
  const iconSize = UI_CONSTANTS.ICON_SIZE.SMALL
  const memberCount = community._count?.communityMembers || 0

  return (
    <div className={styles['profile-info']}>
      <p className={styles['community-name']}>{community.name}</p>
      <InfoRow icon={<MapPin size={iconSize} aria-hidden="true" />} text="종로구" />
      <IconLink
        className={styles['members-count']}
        href={ROUTES.COMMUNITY.MEMBERS(community.clubId)}
        aria-label={MESSAGES.LABEL.MEMBERS_COUNT(memberCount)}
      >
        <Users size={iconSize} aria-hidden="true" />
        <span>{MESSAGES.LABEL.MEMBERS_COUNT(memberCount)}</span>
      </IconLink>
    </div>
  )
})

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
const CommunityContent = memo(({ community }: CommunityContentProps) => {
  const actions: PopoverAction[] = [
    {
      id: 'edit',
      label: '정보 편집',
      onClick: () => {
        console.log('정보 편집')
      },
    },
    {
      id: 'delete',
      label: '삭제',
      isDanger: true,
      onClick: () => {
        console.log('삭제')
      },
    },
  ]
  return (
    <div className={styles['profile-wrapper']}>
      <article className={styles['profile-header']}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <ProfileImage alt={`${community.name} 커뮤니티 프로필 이미지`} />
          <ProfileInfo community={community} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Popover trigger={<Ellipsis />} actions={actions} />
        </div>
      </article>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <p className={styles.description}>
          {community.description || MESSAGES.EMPTY.NO_DESCRIPTION}
        </p>
        <StrokeButton>가입하기</StrokeButton>
      </div>
    </div>
  )
})

/**
 * 커뮤니티 프로필 메인 컴포넌트
 * - 커스텀 훅으로 데이터 fetching/상태 관리
 * - 선언적 조건부 렌더링
 */
export default function StudyProfile({ id }: StudyProfileProps) {
  const { community, loading, error } = useCommunity(id)

  return renderWithLoading(
    loading,
    <LoadingState message={MESSAGES.LOADING.COMMUNITY} />,
    renderWithError(
      error,
      <ErrorState message={error || MESSAGES.ERROR.COMMUNITY_NOT_FOUND} />,
      community ? (
        <CommunityContent community={community} />
      ) : (
        <ErrorState message={MESSAGES.ERROR.COMMUNITY_NOT_FOUND} />
      )
    )
  )
}
