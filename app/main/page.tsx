import StudyCard from '@/app/main/study-card/StudyCard'
import styles from './page.module.css'

export default async function CommunityPage({ params }: { params: { id: string } }) {
  const res = await fetch(`http://localhost:3000/app/api/communities?isPublic=true`, {
    cache: 'no-store',
  })
  //process.env.NEXT_PUBLIC_API_URL

  const communityPage = await res.json()

  //StudyCard로 전달할 형태로 변환
  //참여율 데이터는 값을 정의
  const study = {
    title: communityPage.title,
    desc: communityPage.description,
    imageUrl: communityPage.thumbnail || '',
    tags: communityPage.tags || [],
    value: 75,
    max: 100,
    name: '지난 참여율',
  }

  return (
    <main className={styles.container}>
      <section>
        <StudyCard study={study} />
      </section>
    </main>
  )
}
