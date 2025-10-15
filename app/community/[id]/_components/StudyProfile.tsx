'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Community {
  clubId: string
  name: string
  description: string | null
  isPublic: boolean
  createdAt: string
  tagname?: string[]
  _count?: {
    communityMembers: number
  }
}

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
        <p style={{ color: 'red' }}>{error || '커뮤니티를 찾을 수 없습니다.'}</p>
      </article>
    )
  }

  return (
    <article>
      <Image src="/images/study.png" alt="study" width={100} height={100} />
      <section>
        <h2>{community.name}</h2>
        <p>{community.description || '설명이 없습니다.'}</p>
      </section>
      <section>
        <p>{community.isPublic ? '공개' : '비공개'}</p>
        {community.tagname && community.tagname.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {community.tagname.map((tag, index) => (
              <span
                key={index}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </section>
      <section>
        <p>멤버: {community._count?.communityMembers || 0}명</p>
      </section>
    </article>
  )
}
