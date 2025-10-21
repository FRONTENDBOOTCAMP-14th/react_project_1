'use client'

import StudyCard from '@/app/main/study-card/StudyCard'
import styles from './page.module.css'

export default function main() {
  const study = {
    title: '하낫 둘 셋! 뛰어!',
    desc: '한강에서 제니랑 빠르게 뛰는 러닝클럽입니다.',
    imageUrl: '',
    tags: ['러닝', '러닝메이트', '한강', '페이스5분', '달려라'],
    value: '75',
  }

  return (
    <main className={styles.container}>
      <section>
        <StudyCard study={study} />
      </section>
    </main>
  )
}
