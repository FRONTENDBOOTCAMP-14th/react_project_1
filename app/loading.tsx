import styles from './loading.module.css'

export default function Loading() {
  return (
    <div role="status" aria-live="polite" className={styles.loading}>
      <figure className={styles.figure} role="presentation">
        <span className={styles.spin} />
      </figure>
      <h2 className={styles.h2}>로딩 중...</h2>
      <p className={styles.p}>잠시만 기다려주세요</p>
    </div>
  )
}
