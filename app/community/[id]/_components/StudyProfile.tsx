'use client'

import communityCardStyles from '@/app/_components/CommunityCard.module.css'
import { FormField, SharedForm } from '@/components/common'
import { IconLink, Popover, StrokeButton, type PopoverAction } from '@/components/ui'
import { MESSAGES, ROUTES, UI_CONSTANTS } from '@/constants'
import regions from '@/lib/json/region.json'
import type { Community, UpdateCommunityInput } from '@/lib/types/community'
import { Ellipsis, MapPin, Users } from 'lucide-react'
import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState, useTransition, type ReactNode } from 'react'
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
  /** 커뮤니티 상세 정보 (서버에서 페칭됨) */
  community: import('@/lib/community/communityServer').CommunityDetail
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
  onUpdate: (input: UpdateCommunityInput) => Promise<{ success: boolean; error?: string }>
  /** 커뮤니티 삭제 함수 */
  onDelete: (clubId: string) => Promise<{ success: boolean; error?: string }>
}

/**
 * 커뮤니티 콘텐츠 컴포넌트
 */
function CommunityContent({ community, onUpdate, onDelete }: CommunityContentProps) {
  const router = useRouter()
  const { isAdmin, isMember } = useCommunityContext()
  const clubId = community.clubId // clubId 추출
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

        const result = await onUpdate({
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
    [editForm.name, editForm.description, editForm.tags, region, subRegion, onUpdate]
  )

  /**
   * 커뮤니티 삭제
   */
  const handleDeleteClick = useCallback(async () => {
    if (!confirm('정말로 이 커뮤니티를 삭제하시겠습니까?\n삭제된 커뮤니티는 복구할 수 없습니다.')) {
      return
    }

    try {
      const result = await onDelete(clubId)

      if (result.success) {
        toast.success('커뮤니티가 삭제되었습니다')
        router.push(ROUTES.COMMUNITY.LIST)
      } else {
        toast.error(result.error || '삭제에 실패했습니다')
      }
    } catch (_error) {
      toast.error('삭제 중 오류가 발생했습니다')
    }
  }, [onDelete, clubId, router])

  /**
   * 커뮤니티 이미지 업데이트
   */
  const handleImageUpdate = useCallback(
    async (imageUrl: string) => {
      try {
        const result = await onUpdate({
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
    [onUpdate]
  )

  /**
   * 커뮤니티 가입
   */
  const { data: session } = useSession()
  const [, startTransition] = useTransition()
  const handleJoinClick = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const userId = (session as CustomSession)?.userId

      if (!userId) {
        toast.error('로그인이 필요합니다')
        return
      }

      startTransition(async () => {
        const { createMemberAction } = await import('@/app/actions/members')
        const result = await createMemberAction({
          clubId: community.clubId,
          userId,
          role: 'member',
        })

        if (result.success) {
          toast.success('커뮤니티에 가입되었습니다')
          router.refresh()
        } else {
          toast.error(result.error || '가입에 실패했습니다')
        }
      })
    },
    [community.clubId, session, router]
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
        <SharedForm
          onSubmit={handleSaveEdit}
          submitText="저장"
          cancelText="취소"
          onCancel={handleCancelEdit}
          submitButtonType="accent"
          cancelButtonType="stroke"
        >
          <FormField
            label={MESSAGES.LABEL.COMMUNITY_NAME}
            type="text"
            value={editForm.name}
            onChange={value =>
              setEditForm(prev => ({
                ...prev,
                name: typeof value === 'string' ? value : String(value),
              }))
            }
            required
            placeholder={MESSAGES.LABEL.COMMUNITY_NAME_PLACEHOLDER}
            fieldId="community-name-edit"
            ariaDescription={MESSAGES.LABEL.COMMUNITY_NAME_ARIA}
          />

          <FormField
            label={MESSAGES.LABEL.COMMUNITY_DESCRIPTION}
            type="textarea"
            value={editForm.description}
            onChange={value =>
              setEditForm(prev => ({
                ...prev,
                description: typeof value === 'string' ? value : String(value),
              }))
            }
            placeholder={MESSAGES.LABEL.COMMUNITY_DESCRIPTION_PLACEHOLDER}
            rows={4}
            fieldId="community-description-edit"
            ariaDescription={MESSAGES.LABEL.COMMUNITY_DESCRIPTION_ARIA}
          />

          <FormField
            label={MESSAGES.LABEL.COMMUNITY_TAGS}
            type="text"
            value={editForm.tags}
            onChange={value =>
              setEditForm(prev => ({
                ...prev,
                tags: typeof value === 'string' ? value : String(value),
              }))
            }
            placeholder={MESSAGES.LABEL.COMMUNITY_TAGS_PLACEHOLDER}
            fieldId="community-tags-edit"
            ariaDescription={MESSAGES.LABEL.COMMUNITY_TAGS_ARIA}
          />

          <FormField
            label={MESSAGES.LABEL.COMMUNITY_REGION}
            type="select"
            value={region}
            onChange={value => {
              setRegion(typeof value === 'string' ? value : String(value))
              setSubRegion('') // 지역 변경 시 하위 지역 초기화
            }}
            options={regions.map(regionData => ({
              value: regionData.region,
              label: regionData.region,
            }))}
            placeholder={MESSAGES.LABEL.COMMUNITY_REGION_PLACEHOLDER}
            fieldId="community-region-edit"
            ariaDescription={MESSAGES.LABEL.COMMUNITY_REGION_ARIA}
          />

          {region && (
            <FormField
              label={MESSAGES.LABEL.COMMUNITY_SUBREGION}
              type="select"
              value={subRegion}
              onChange={value => setSubRegion(typeof value === 'string' ? value : String(value))}
              options={
                regions
                  .find(regionData => regionData.region === region)
                  ?.subRegion.map(sub => ({ value: sub, label: sub })) || []
              }
              placeholder={MESSAGES.LABEL.COMMUNITY_SUBREGION_PLACEHOLDER}
              required
              fieldId="community-subregion-edit"
              ariaDescription={MESSAGES.LABEL.COMMUNITY_SUBREGION_ARIA}
            />
          )}
        </SharedForm>
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
 * - Server Component에서 전달받은 데이터 사용
 * - 클라이언트 fetch 불필요
 * - Server Actions로 데이터 수정
 */
export default function StudyProfile({ id, community }: StudyProfileProps) {
  // Server Actions로 데이터 수정 함수들
  const updateCommunity = async (input: UpdateCommunityInput) => {
    const { updateCommunityAction } = await import('@/app/actions/community')
    return updateCommunityAction(id, input)
  }

  const deleteCommunity = async () => {
    const { deleteCommunityAction } = await import('@/app/actions/community')
    return deleteCommunityAction(id)
  }

  return (
    <CommunityContent community={community} onUpdate={updateCommunity} onDelete={deleteCommunity} />
  )
}
