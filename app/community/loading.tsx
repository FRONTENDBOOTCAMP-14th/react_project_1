import styles from './community.module.css'

export default function CommunitiesLoading() {
  return (
    <>
      <div className={styles.header}>
        <h1>전체 커뮤니티</h1>
        <p>참여 가능한 모든 커뮤니티를 확인하세요</p>
      </div>

      <div className={styles.content}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    </>
  )
}
