'use client'

import { memo, useMemo, type ReactNode } from 'react'
import styles from './StudyProfile.module.css'
import type { Community } from '@/lib/types/community'
import { Ellipsis, MapPin, Users } from 'lucide-react'
import { useCommunity } from '@/lib/hooks'
import { useCommunityStore } from '../_hooks/useCommunityStore'
import { renderWithLoading, renderWithError } from '@/lib/utils'
import { LoadingState, ErrorState } from '@/components/common'
import { UI_CONSTANTS, MESSAGES, ROUTES } from '@/constants'
import { StrokeButton, Popover, type PopoverAction, IconLink, ProfileImage } from '@/components/ui'
import { toast } from 'sonner'

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
 * StudyProfile 컴포넌트에 전달되는 속성
 */
interface StudyProfileProps {
  /** 커뮤니티 ID */
  id: string
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
  const isTeamLeader = useCommunityStore(state => state.isTeamLeader)
  const isMember = useCommunityStore(state => state.isMember)

  // 팀장 전용 액션 메뉴
  const actions: PopoverAction[] = useMemo(
    () => [
      {
        id: 'edit',
        label: '정보 편집',
        onClick: () => {
          toast('정보 편집')
        },
      },
      {
        id: 'delete',
        label: '삭제',
        isDanger: true,
        onClick: () => {
          toast('삭제')
        },
      },
    ],
    []
  )
  return (
    <div className={styles['profile-wrapper']}>
      <article className={styles['profile-header']}>
        <div className={styles['header-left']}>
          <ProfileImage
            alt={`${community.name} 커뮤니티 프로필 이미지`}
            radius="inner-card-radius"
          />
          <ProfileInfo community={community} />
        </div>
        {isTeamLeader && (
          <div className={styles['header-right']}>
            <Popover trigger={<Ellipsis />} actions={actions} />
          </div>
        )}
      </article>
      <div className={styles['description-row']}>
        <p className={styles.description}>
          {community.description || MESSAGES.EMPTY.NO_DESCRIPTION}
        </p>
        {!isMember ? (
          <StrokeButton onClick={() => toast('가입 기능 구현 예정')}>가입하기</StrokeButton>
        ) : (
          !isTeamLeader && (
            <StrokeButton onClick={() => toast('탈퇴 기능 구현 예정')}>탈퇴하기</StrokeButton>
          )
        )}
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
  const { community, loading, error, refetch, createCommunity, updateCommunity, deleteCommunity } =
    useCommunity(id)

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
