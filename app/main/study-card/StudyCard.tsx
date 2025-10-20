'use clinet'

import { toast } from 'sonner'
import styles from './StudyCard.module.css'

import { StrokeButton } from '@/components/ui'

// 스터디 정보 타입
interface Study {
  title: string
  desc: string
  imageUrl: string
  tags: string[]
}

// 카드 컴포넌트 props 타입
interface StudyCardProps {
  study: Study
  /** 추가 className */
  className?: string
  /** 가입 버튼 클릭시 커스텀 동작 */
  /** onJoin?: () => void */
}

export default function StudyCard({ study }: StudyCardProps) {
  // const Study = {
  //   title: '하낫 둘 셋! 뛰어!'
  //   desc: '한강에서 제니랑 빠르게 뛰는 러닝클럽입니다.'
  //   imageUrl: ''
  //   tags: ['러닝','러닝메이트','한강','페이스5분']
  // }

  return (
    <article className={styles.card}>
      <h2 className="sr-only">스터디 소개</h2>

      <p className={styles.title}>{study.title}</p>
      {/* 스터디대표 이미지는 배경이미지로 표시 */}
      <figure
        className={styles.image}
        style={{
          backgroundImage: `url(${study.imageUrl || '/assets/default-study01.png'})`,
        }}
        // 이미지 에셋 위치 지정필요
      />
      <p className={styles.desc}>{study.desc}</p>
      <StrokeButton onClick={() => toast('가입이 완료되었습니다!')}>가입하기</StrokeButton>
      <ul className={styles.tags}>
        {study.tags.map((tag, index) => (
          <li key={index}>{tag}</li>
        ))}
      </ul>
    </article>
  )
}
