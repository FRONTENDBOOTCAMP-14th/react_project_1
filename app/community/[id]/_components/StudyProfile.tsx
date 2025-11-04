'use client'

import communityCardStyles from '@/app/_components/CommunityCard.module.css'
import { ErrorState, LoadingState } from '@/components/common'
import { Dropdown, IconLink, Popover, StrokeButton, type PopoverAction } from '@/components/ui'
import { MESSAGES, ROUTES, UI_CONSTANTS } from '@/constants'
import { useCommunity } from '@/lib/hooks'
import regions from '@/lib/json/region.json'
import type { Community, UpdateCommunityInput } from '@/lib/types/community'
import { renderWithError, renderWithLoading } from '@/lib/utils'
import { Ellipsis, MapPin, Users } from 'lucide-react'
import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useCommunityContext } from '../_context/CommunityContext'
import CommunityImageUploader from './CommunityImageUploader'
import styles from './StudyProfile.module.css'

interface CustomSession extends Session {
  userId?: string
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
 * StudyProfile 컴포넌트에 전달되는 속성
 */
interface StudyProfileProps {
  /** 커뮤니티 ID */
  id: string
}

/**
 * 정보 행 컴포넌트
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
 * 커뮤니티 정보 컴포넌트
 */
function ProfileInfo({ community }: ProfileInfoProps) {
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
      {community.tagname && community.tagname.length > 0 && (
        <ul className={communityCardStyles.tagList}>
          {community.tagname.map(tag => (
            <li key={tag} className={communityCardStyles.tag}>
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

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
 * 커뮤니티 콘텐츠 컴포넌트
 */
function CommunityContent({ community, onUpdate, onDelete }: CommunityContentProps) {
  const router = useRouter()
  const { isAdmin, isMember } = useCommunityContext()
  const [region, setRegion] = useState(community.region || '')
  const [subRegion, setSubRegion] = useState(community.subRegion || '')

  // 편집 상태
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: community.name,
    description: community.description || '',
    tags: (community.tagname || []).join(', '),
  })

  /**
   * 편집 모드 시작
   */
  const handleEditClick = useCallback(() => {
    setEditForm({
      name: community.name,
      description: community.description || '',
      tags: (community.tagname || []).join(', '),
    })
    setIsEditing(true)
  }, [community.name, community.description, community.tagname])

  /**
   * 편집 취소
   */
  const handleCancelEdit = useCallback(() => {
    setEditForm({
      name: community.name,
      description: community.description || '',
      tags: (community.tagname || []).join(', '),
    })
    setIsEditing(false)
  }, [community.name, community.description, community.tagname])

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
        const tagArray = editForm.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)

        const result = await onUpdate(community.clubId, {
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          region: region || null,
          subRegion: subRegion || null,
          tagname: tagArray,
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
    [
      editForm.name,
      editForm.description,
      editForm.tags,
      region,
      subRegion,
      onUpdate,
      community.clubId,
    ]
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

  /**
   * 커뮤니티 이미지 업데이트
   */
  const handleImageUpdate = useCallback(
    async (imageUrl: string) => {
      try {
        const result = await onUpdate(community.clubId, {
          imageUrl,
        })

        if (!result.success) {
          throw new Error(result.error || '이미지 업데이트에 실패했습니다')
        }
      } catch (error) {
        console.error('Image update error:', error)
        throw error
      }
    },
    [onUpdate, community.clubId]
  )

  /**
   * 커뮤니티 가입
   */
  const { data: session } = useSession()
  const handleJoinClick = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const userId = (session as CustomSession)?.userId

      if (!userId) {
        toast.error('로그인이 필요합니다')
        return
      }

      try {
        const response = await fetch('/api/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clubId: community.clubId,
            userId,
            role: 'member',
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          toast.success('커뮤니티에 가입되었습니다')
          // 페이지 새로고침으로 멤버십 상태 업데이트
          window.location.reload()
        } else {
          toast.error(data.error || '가입에 실패했습니다')
        }
      } catch (error) {
        console.error('Failed to join community:', error)
        toast.error('가입 중 오류가 발생했습니다')
      }
    },
    [community.clubId, session]
  )

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
              <label>태그</label>
              <input
                type="text"
                value={editForm.tags}
                onChange={e => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder=",로 구분하여 입력 (예: 알고리즘, 독서, CS)"
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
          <CommunityImageUploader
            currentImageUrl={community.imageUrl}
            communityName={community.name}
            onImageUpdate={handleImageUpdate}
            isAdmin={isAdmin}
          />
          <ProfileInfo community={community} />
        </div>
        {isAdmin && (
          <div className={styles['header-right']}>
            <Popover trigger={<Ellipsis />} actions={actions} />
          </div>
        )}
      </article>
      <div className={styles['description-row']}>
        <p className={styles.description}>
          {community.description || MESSAGES.EMPTY.NO_DESCRIPTION}
        </p>
        {!isMember && (
          <StrokeButton style={{ minWidth: '76px' }} type="button" onClick={handleJoinClick}>
            가입하기
          </StrokeButton>
        )}
      </div>
    </div>
  )
}

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
