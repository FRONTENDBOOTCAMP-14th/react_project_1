import SearchForm from './_components/SearchForm'
import ProfileCard from './_components/ProfileCard'
import styles from './page.module.css'

export default function MemberPage() {
  return (
    <div className={styles.container}>
      <SearchForm placeholder="검색어를 입력해주세요" />
      <div className={styles.content}>
        {Array.from({ length: 10 }).map((_, index) => (
          <ProfileCard key={index} name="이름" />
        ))}
      </div>
    </div>
  )
}
