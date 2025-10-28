'use client'

import { IconLink, ProfileImage } from '@/components/ui'
import { ROUTES } from '@/constants'
import type { Community } from '@/lib/types'
import styles from './CommunityCard.module.css'

/**
 * 커뮤니티 카드 컴포넌트 Props
 */
interface CommunityCardProps {
  community: Community
  className?: string
}

/**
 * 커뮤니티 카드 컴포넌트
 * - 커뮤니티 정보를 카드 형태로 표시
 * - 가입 기능 및 상세 페이지 이동 지원
 */
export default function CommunityCard({ community, className }: CommunityCardProps) {
  return (
    <article className={`${styles.card} ${className || ''}`}>
      <h2 className="sr-only">커뮤니티 소개</h2>

      <div className={styles.content}>
        <IconLink
          href={ROUTES.COMMUNITY.DETAIL(community.clubId)}
          className={styles.title}
          style={{ cursor: 'pointer' }}
        >
          {community.name}
        </IconLink>
        <p className={styles.desc}>{community.description || '설명이 없습니다.'}</p>
      </div>

      <div className={styles.join}>
        <ProfileImage alt={community.name} radius="inner-card-radius" />
      </div>

      {/* 태그가 없을 경우에는 ul렌더 누락 그외엔 모든 태그 li로 표시*/}
      {community.tagname && community.tagname.length > 0 && (
        <ul className={styles.tagList}>
          {community.tagname?.slice(0, 10).map((tag, index) => (
            <li key={tag + index} className={styles.tag}>
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
