'use client'

import { useEffect, useState } from 'react'
import styles from './RecommendedStudies.module.css'
import type { CommunityBase, CommunityListResponse } from '@/lib/types/community'

export default function RecommendedStudies() {
  const [communities, setCommunities] = useState<CommunityBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setIsLoading(true)
        // 추천 커뮤니티 조회 (공개 커뮤니티 우선, 최신순)
        const response = await fetch('/api/communities?limit=3&isPublic=true')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = (await response.json()) as CommunityListResponse

        // response 유틸리티 타입을 활용한 타입 안전한 응답 처리
        if (result.success) {
          const communitiesData = result.data
          // 데이터 유효성 검증
          if (communitiesData && Array.isArray(communitiesData)) {
            setCommunities(communitiesData)
            setError(null) // 성공 시 에러 초기화
          } else {
            setCommunities([])
            setError('데이터 형식이 올바르지 않습니다')
          }
        } else {
          // API 응답이 실패한 경우 - response 유틸리티 패턴 활용
          throw new Error(result.error || '커뮤니티 데이터를 불러올 수 없습니다')
        }
      } catch (err) {
        console.error('Error fetching recommended studies:', err)

        // response 유틸리티 패턴에 맞춰 명확한 에러 메시지 설정
        if (err instanceof TypeError && err.message.includes('fetch')) {
          // 네트워크 에러 (Failed to fetch 등)
          setError('네트워크 연결을 확인해주세요')
        } else if (err instanceof Error) {
          // API 에러 또는 HTTP 에러
          if (err.message.includes('HTTP')) {
            setError('서버 응답에 문제가 있습니다')
          } else {
            // API 에러 메시지 그대로 사용
            setError(err.message)
          }
        } else {
          setError('알 수 없는 오류가 발생했습니다')
        }

        setCommunities([]) // 에러 발생 시 빈 배열로 초기화
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommunities()
  }, [])

  return (
    <div className={styles['footer-container']}>
      <h2>추천 스터디</h2>
      <div className={styles['recommend-container']}>
        {isLoading ? (
          <div className={styles['recommend-item']}>로딩 중...</div>
        ) : error ? (
          <div className={styles['recommend-item']}>데이터를 불러올 수 없습니다: {error}</div>
        ) : Array.isArray(communities) && communities.length > 0 ? (
          communities.map(community => (
            <div key={community.clubId} className={styles['recommend-item']}>
              <div style={{ fontWeight: 600 }}>{community.name}</div>
              {community.description && (
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '4px' }}>
                  {community.description}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles['recommend-item']}>추천 스터디가 없습니다</div>
        )}
      </div>
    </div>
  )
}
