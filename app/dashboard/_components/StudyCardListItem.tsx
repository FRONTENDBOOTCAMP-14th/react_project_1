'use client'

import { memo } from 'react'
import styles from './StudyCardListItem.module.css'
import Link from 'next/link'
import { Popover, type PopoverAction } from '@/components/ui'
import { EllipsisVertical } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import DefaultImg from '@/app/community/new/_components/assets/default-study01.png'

interface StudyCardListItemProps {
  clubId: string
  userId: string
  name: string
  description: string
  region: string
  subRegion: string
  imageUrl?: string
  isTeamLeader: boolean
}

function StudyCardListItem({
  clubId,
  userId,
  name,
  description,
  region,
  subRegion,
  imageUrl,
  isTeamLeader,
}: StudyCardListItemProps) {
  const handleLeaveCommunity = async (clubId: string) => {
    try {
      const getMemberResponse = await fetch(`/api/members?clubId=${clubId}&userId=${userId}`)

      if (!getMemberResponse.ok) {
        console.error('Failed to fetch member')
        toast.error('멤버 정보를 가져오는데 실패했습니다')
        return
      }

      const memberData = await getMemberResponse.json()
      const members = memberData.data

      if (!members || members.length === 0) {
        console.error('Member not found for leave:', { clubId, userId })
        toast.error('멤버를 찾을 수 없습니다')
        return
      }

      const memberId = members.data[0].id

      const deleteResponse = await fetch(`/api/members/${memberId}`, {
        method: 'DELETE',
      })

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json()
        console.error('Failed to leave community:', errorData)
        toast.error('커뮤니티 탈퇴에 실패했습니다')
        return
      }

      toast.success('커뮤니티를 탈퇴했습니다')
      window.location.reload()
    } catch (error) {
      console.error('Error leaving community:', error)
      toast.error('커뮤니티 탈퇴 중 오류가 발생했습니다')
    }
  }
  const popoverActions: PopoverAction[] = [
    {
      id: `leave-${clubId}`,
      label: '탈퇴',
      onClick: () => {
        if (
          confirm('정말로 이 커뮤니티를 탈퇴하시겠습니까?\n탈퇴된 커뮤니티는 복구할 수 없습니다.')
        ) {
          handleLeaveCommunity(clubId)
        }
      },
      isDanger: true,
    },
  ]
  return (
    <li key={clubId} className={styles['item-container']}>
      <div className={styles.item}>
        <div className={styles.header}>
          <Link className={styles.link} href={`/community/${clubId}`}>
            <Image
              width={90}
              height={90}
              src={imageUrl || DefaultImg.src}
              alt={`${name} 커뮤니티 이미지`}
              className={styles.image}
            />
            <div className={styles['link-data']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {name} <span className={styles.badge}>{isTeamLeader ? '팀장' : '멤버'}</span>
              </div>
              <span className={styles.description}>{description}</span>
              <span className={styles.description}>
                지역: {region} {subRegion}
              </span>
            </div>
          </Link>
          <Popover trigger={<EllipsisVertical />} actions={popoverActions} />
        </div>
      </div>
    </li>
  )
}

export default memo(StudyCardListItem)
