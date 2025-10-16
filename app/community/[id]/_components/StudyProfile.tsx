'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from './StudyProfile.module.css'
import type { Community } from '@/types/community'
import { MapPin, Users } from 'lucide-react'

export default function StudyProfile({ id }: { id: string }) {
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true)
        setError(null)

        // 특정 커뮤니티 단건 조회 API 호출
        const apiUrl = `/api/communities/${id}`
        console.log('호출할 API URL:', apiUrl)
        console.log('요청할 clubId:', id)

        const response = await fetch(apiUrl)
        const data = await response.json()

        console.log('API 응답:', data)
        console.log('HTTP 상태 코드:', response.status)

        if (data.ok && data.data) {
          console.log('커뮤니티 데이터:', data.data)
          setCommunity(data.data)
        } else {
          console.error('API 에러:', data.error)
          setError(data.error || '커뮤니티 정보를 불러올 수 없습니다.')
        }
      } catch (err) {
        console.error('Failed to fetch community:', err)
        setError('커뮤니티 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchCommunity()
  }, [id])

  if (loading) {
    return (
      <article>
        <p>로딩 중...</p>
      </article>
    )
  }

  if (error || !community) {
    return (
      <article>
        <p className="error">{error || '커뮤니티를 찾을 수 없습니다.'}</p>
      </article>
    )
  }

  return (
    <div className={styles['profile-wrapper']}>
      <article className={styles['profile-header']}>
        <div className={styles['image-container']}>
          <Image src="/images/example.jpg" alt="" width={90} height={90} className={styles.image} />
        </div>
        <div className={styles['profile-info']}>
          <p className={styles['community-name']}>{community.name}</p>
          <section className={styles['info-row']}>
            <MapPin size={16} />
            <p>종로구</p>
          </section>
          <section className={styles['info-row']}>
            <Users size={16} />
            <p>멤버: {community._count?.communityMembers || 0}명</p>
          </section>
        </div>
      </article>
      <p className={styles.description}>{community.description || '설명이 없습니다.'}</p>
    </div>
  )
}
