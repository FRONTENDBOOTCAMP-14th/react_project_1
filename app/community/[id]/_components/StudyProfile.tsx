'use client'

import { memo, useMemo, useState, useCallback, type ReactNode } from 'react'
import styles from './StudyProfile.module.css'
import type { Community, UpdateCommunityInput } from '@/lib/types/community'
import { Ellipsis, MapPin, Users } from 'lucide-react'
import { useCommunity } from '@/lib/hooks'
import { useCommunityStore } from '../_hooks/useCommunityStore'
import { renderWithLoading, renderWithError } from '@/lib/utils'
import { LoadingState, ErrorState } from '@/components/common'
import { UI_CONSTANTS, MESSAGES, ROUTES } from '@/constants'
import {
  StrokeButton,
  Popover,
  type PopoverAction,
  IconLink,
  ProfileImage,
  Dropdown,
} from '@/components/ui'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import regions from '@/lib/json/region.json'

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
      <InfoRow
        icon={<MapPin size={iconSize} aria-hidden="true" />}
        text={`${community.region} ${community.subRegion}`}
      />
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
  /** 커뮤니티 수정 함수 */
  onUpdate: (
    clubId: string,
    input: UpdateCommunityInput
  ) => Promise<{ success: boolean; error?: string }>
  /** 커뮤니티 삭제 함수 */
  onDelete: (clubId: string) => Promise<{ success: boolean; error?: string }>
}

/**
 * 커뮤니티 콘텐츠 컴포넌트 (순수 컴포넌트)
 */
const CommunityContent = memo(({ community, onUpdate, onDelete }: CommunityContentProps) => {
  const router = useRouter()
  const isTeamLeader = useCommunityStore(state => state.isTeamLeader)
  const isMember = useCommunityStore(state => state.isMember)
  const [region, setRegion] = useState(community.region || '')
  const [subRegion, setSubRegion] = useState(community.subRegion || '')

  // 편집 상태
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: community.name,
    description: community.description || '',
  })

  /**
   * 편집 모드 시작
   */
  const handleEditClick = useCallback(() => {
    setEditForm({
      name: community.name,
      description: community.description || '',
    })
    setIsEditing(true)
  }, [community.name, community.description])

  /**
   * 편집 취소
   */
  const handleCancelEdit = useCallback(() => {
    setEditForm({
      name: community.name,
      description: community.description || '',
    })
    setIsEditing(false)
  }, [community.name, community.description])

  /**
   * 편집 저장
   */
  const handleSaveEdit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!editForm.name.trim()) {
        toast.error('커뮤니티 이름을 입력해주세요')
        return
      }

      if (region && !subRegion) {
        toast.error('하위 지역을 선택해주세요')
        return
      }

      try {
        const result = await onUpdate(community.clubId, {
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          region: region || null,
          subRegion: subRegion || null,
        })

        if (result.success) {
          toast.success('커뮤니티 정보가 수정되었습니다')
          setIsEditing(false)
        } else {
          toast.error(result.error || '수정에 실패했습니다')
        }
      } catch (_error) {
        toast.error('수정 중 오류가 발생했습니다')
      }
    },
    [editForm.name, editForm.description, region, subRegion, onUpdate, community.clubId]
  )

  /**
   * 커뮤니티 삭제
   */
  const handleDeleteClick = useCallback(async () => {
    if (!confirm('정말로 이 커뮤니티를 삭제하시겠습니까?\n삭제된 커뮤니티는 복구할 수 없습니다.')) {
      return
    }

    try {
      const result = await onDelete(community.clubId)

      if (result.success) {
        toast.success('커뮤니티가 삭제되었습니다')
        router.push(ROUTES.COMMUNITY.LIST)
      } else {
        toast.error(result.error || '삭제에 실패했습니다')
      }
    } catch (_error) {
      toast.error('삭제 중 오류가 발생했습니다')
    }
  }, [onDelete, community.clubId, router])

  // 팀장 전용 액션 메뉴
  const actions: PopoverAction[] = useMemo(
    () => [
      {
        id: 'edit',
        label: '정보 편집',
        onClick: handleEditClick,
      },
      {
        id: 'delete',
        label: '삭제',
        isDanger: true,
        onClick: handleDeleteClick,
      },
    ],
    [handleEditClick, handleDeleteClick]
  )
  // 편집 모드 UI
  if (isEditing) {
    return (
      <div className={styles['profile-wrapper']}>
        <form onSubmit={handleSaveEdit} className={styles['edit-form']}>
          <div className={styles['edit-fields']}>
            <div className={styles['edit-field']}>
              <label>커뮤니티 이름</label>
              <input
                type="text"
                value={editForm.name}
                onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="커뮤니티 이름을 입력하세요"
              />
            </div>
            <div className={styles['edit-field']}>
              <label>설명</label>
              <textarea
                value={editForm.description}
                onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="커뮤니티 설명을 입력하세요"
                rows={4}
              />
            </div>
            <div className={styles['edit-field']}>
              <label>지역</label>
              <Dropdown
                options={regions.map(regionData => ({
                  value: regionData.region,
                  label: regionData.region,
                }))}
                value={region}
                onChange={value => {
                  setRegion(value)
                  setSubRegion('') // 지역 변경 시 하위 지역 초기화
                }}
                placeholder="지역을 선택하세요"
              />
              <Dropdown
                options={
                  regions
                    .find(regionData => regionData.region === region)
                    ?.subRegion.map(sub => ({ value: sub, label: sub })) || []
                }
                value={subRegion}
                onChange={setSubRegion}
                placeholder="하위 지역을 선택하세요"
              />
            </div>
          </div>
          <div className={styles['edit-actions']}>
            <button type="submit" className={styles['save-button']}>
              저장
            </button>
            <button type="button" onClick={handleCancelEdit} className={styles['cancel-button']}>
              취소
            </button>
          </div>
        </form>
      </div>
    )
  }

  // 일반 표시 모드 UI
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
          <StrokeButton type="button" onClick={() => toast('가입 기능 구현 예정')}>
            가입하기
          </StrokeButton>
        ) : (
          !isTeamLeader && (
            <StrokeButton type="button" onClick={() => toast('탈퇴 기능 구현 예정')}>
              탈퇴하기
            </StrokeButton>
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
  const { community, loading, error, updateCommunity, deleteCommunity } = useCommunity(id)

  return renderWithLoading(
    loading,
    <LoadingState message={MESSAGES.LOADING.COMMUNITY} />,
    renderWithError(
      error,
      <ErrorState message={error || MESSAGES.ERROR.COMMUNITY_NOT_FOUND} />,
      community ? (
        <CommunityContent
          community={community}
          onUpdate={updateCommunity}
          onDelete={deleteCommunity}
        />
      ) : (
        <ErrorState message={MESSAGES.ERROR.COMMUNITY_NOT_FOUND} />
      )
    )
  )
}
