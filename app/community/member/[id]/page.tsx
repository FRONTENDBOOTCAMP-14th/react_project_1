import SearchForm from './_components/SearchForm'
import ProfileCard from './_components/ProfileCard'
import styles from './page.module.css'

export default function MemberPage() {
  return (
    <div className={styles.container}>
      <SearchForm placeholder="검색어를 입력해주세요" />
      <ProfileCard name="이름" />
    </div>
  )
}
