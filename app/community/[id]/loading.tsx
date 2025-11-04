import styles from './loading.module.css'

export default function CommunityLoading() {
  return (
    <div className={styles['loading-container']}>
      <div className={`${styles['loading-block']} ${styles['loading-block-large']}`} />
      <div className={`${styles['loading-block']} ${styles['loading-block-medium']}`} />
      <div className={`${styles['loading-block']} ${styles['loading-block-small']}`} />
    </div>
  )
}
