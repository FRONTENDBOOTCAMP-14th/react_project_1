'use client'

import DefaultImg from '@/app/community/new/_components/assets/default-study01.png'
import { Popover, type PopoverAction } from '@/components/ui'
import { MESSAGES } from '@/constants'
import { EllipsisVertical } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'
import styles from './StudyCardListItem.module.css'

interface CommunityCardProps {
  clubId: string
  name: string
  description: string
  region: string
  subRegion: string
  imageUrl?: string
  isAdmin: boolean
  onLeave?: (clubId: string) => Promise<void>
}

const CommunityCard = memo(
  ({
    clubId,
    name,
    description,
    region,
    subRegion,
    imageUrl,
    isAdmin,
    onLeave,
  }: CommunityCardProps) => {
    const popoverActions: PopoverAction[] = [
      ...(onLeave
        ? [
            {
              id: `leave-${clubId}`,
              label: MESSAGES.DASHBOARD.LEAVE_COMMUNITY,
              onClick: () => onLeave(clubId),
              isDanger: true,
            },
          ]
        : []),
    ]

    return (
      <li className={styles['item-container']}>
        <div className={styles.item}>
          <div className={styles.header}>
            <Link
              className={styles.link}
              href={`/community/${clubId}`}
              aria-label={`${name} 커뮤니티 상세 페이지로 이동`}
            >
              <Image
                width={90}
                height={90}
                src={imageUrl || DefaultImg.src}
                alt={`${name} 커뮤니티 이미지`}
                className={styles.image}
              />
              <div className={styles['link-data']}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span aria-label={`커뮤니티 이름: ${name}`}>{name}</span>
                  <span className={styles.badge} aria-label={`역할: ${isAdmin ? '팀장' : '멤버'}`}>
                    {isAdmin ? '팀장' : '멤버'}
                  </span>
                </div>
                <span className={styles.description} aria-label={`설명: ${description}`}>
                  {description}
                </span>
                <span className={styles.description} aria-label={`지역: ${region} ${subRegion}`}>
                  지역: {region} {subRegion}
                </span>
              </div>
            </Link>
            <Popover
              trigger={
                <button aria-label={`${name} 커뮤니티 메뉴`} className={styles.menuButton}>
                  <EllipsisVertical />
                </button>
              }
              actions={popoverActions}
            />
          </div>
        </div>
      </li>
    )
  }
)

export { CommunityCard }
