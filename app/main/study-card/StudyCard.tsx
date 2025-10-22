'use clinet'

import { toast } from 'sonner'
import styles from './StudyCard.module.css'

import { StrokeButton, ParticipateRate } from '@/components/ui'

// 스터디 정보 타입
interface Study {
  title: string
  desc: string
  imageUrl: string
  tags: string[]
  value: number
  max?: number
  name: string
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
  return (
    <article className={styles.card}>
      <h2 className="sr-only">스터디 소개</h2>
      <div className={styles.content}>
        <p className={styles.title}>{study.title}</p>
        {/* 스터디대표 이미지는 배경이미지로 표시 */}
        <p className={styles.desc}>{study.desc}</p>
        <ParticipateRate name="지난 참여율" value={study.value} max={100} />
      </div>
      <div className={styles.join}>
        <figure
          className={styles.image}
          style={{
            backgroundImage: `url(${study.imageUrl || '/assets/default-study01.png'})`,
          }}
          aria-hidden="true"
          // 기본 이미지 에셋 위치 지정후 url 수정필요
        />
        <StrokeButton
          onClick={() => toast('가입이 완료되었습니다!')}
          type="button"
          style={{
            color: 'var(--accent-color)',
            border: '1px solid var(--accent-color)',
          }}
        >
          가입하기
        </StrokeButton>
      </div>

      <ul className={styles.tagList}>
        {study.tags.map((tag, index) => (
          <li key={index} className={styles.tag}>
            {tag}
          </li>
        ))}
      </ul>
    </article>
  )
}
