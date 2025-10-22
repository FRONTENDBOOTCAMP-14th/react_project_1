'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { StrokeButton, ParticipateRate, ProfileImage } from '@/components/ui'
import { ROUTES } from '@/constants'
import type { CommunityBase } from '@/lib/types'
import styles from './CommunityCard.module.css'

/**
 * 커뮤니티 카드 컴포넌트 Props
 */
interface CommunityCardProps {
  community: CommunityBase
  className?: string
}

/**
 * 커뮤니티 카드 컴포넌트
 * - 커뮤니티 정보를 카드 형태로 표시
 * - 가입 기능 및 상세 페이지 이동 지원
 */
export default function CommunityCard({ community, className }: CommunityCardProps) {
  const router = useRouter()

  /**
   * 커뮤니티 가입 처리
   */
  const handleJoin = async () => {
    try {
      // TODO: 실제 API 호출로 커뮤니티 가입 처리
      toast.success('커뮤니티 가입이 완료되었습니다!')

      // 커뮤니티 상세 페이지로 이동
      router.push(ROUTES.COMMUNITY.DETAIL(community.clubId))
    } catch (error) {
      console.error('Failed to join community:', error)
      toast.error('커뮤니티 가입에 실패했습니다.')
    }
  }

  /**
   * 커뮤니티 상세 페이지로 이동
   */
  const handleViewDetail = () => {
    router.push(ROUTES.COMMUNITY.DETAIL(community.clubId))
  }

  return (
    <article className={`${styles.card} ${className || ''}`}>
      <h2 className="sr-only">커뮤니티 소개</h2>

      <div className={styles.content}>
        <p className={styles.title} onClick={handleViewDetail} style={{ cursor: 'pointer' }}>
          {community.name}
        </p>
        <p className={styles.desc}>{community.description || '설명이 없습니다.'}</p>
        <ParticipateRate name="지난 참여율" value={0} max={100} />
      </div>

      <div className={styles.join}>
        <ProfileImage alt={community.name} radius="inner-card-radius" />
        <StrokeButton
          onClick={handleJoin}
          type="button"
          style={{
            color: 'var(--accent-color)',
            border: '1px solid var(--accent-color)',
          }}
        >
          가입하기
        </StrokeButton>
      </div>

      {/* 태그는 추후 구현 예정 */}
      <ul className={styles.tagList}>
        {community.isPublic && <li className={styles.tag}>공개</li>}
      </ul>
    </article>
  )
}
