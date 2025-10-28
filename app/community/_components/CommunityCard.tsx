'use client'

import { IconLink } from '@/components/ui'
import { ROUTES } from '@/constants'
import type { Community } from '@/lib/types'
import styles from './CommunityCard.module.css'
import Image from 'next/image'
import DefaultImg from '@/app/community/new/_components/assets/default-study01.png'

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
        <Image
          src={community.imageUrl || DefaultImg.src}
          alt={`${community.name} 커뮤니티 이미지`}
          width={150}
          height={150}
          className={styles.image}
        />
      </div>

      <ul className={styles.tagList}>
        {community.tagname?.map(tag => (
          <li key={tag} className={styles.tag}>
            {tag}
          </li>
        ))}
      </ul>
    </article>
  )
}
