'use client'

import DefaultImg from '@/app/community/new/_components/assets/default-study01.png'
import { IconLink } from '@/components/ui'
import { MESSAGES, ROUTES } from '@/constants'
import type { Community } from '@/lib/types'
import Image from 'next/image'
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
      <h2 className="sr-only">{MESSAGES.LABEL.COMMUNITY_INTRO}</h2>

      <div className={styles.content}>
        <IconLink href={ROUTES.COMMUNITY.DETAIL(community.clubId)} className={styles.title}>
          {community.name}
        </IconLink>
        <p className={styles.desc}>{community.description || MESSAGES.EMPTY.NO_DESCRIPTION}</p>
      </div>

      <div className={styles.join}>
        <Image
          src={community.imageUrl || DefaultImg.src}
          alt={MESSAGES.LABEL.COMMUNITY_IMAGE_ALT(community.name)}
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
