import { MESSAGES } from '@/constants'
import styles from './community.module.css'

export default function CommunitiesLoading() {
  return (
    <>
      <div className={styles.header}>
        <h1>{MESSAGES.LABEL.ALL_COMMUNITIES}</h1>
        <p>{MESSAGES.LABEL.COMMUNITY_DESCRIPTION}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.loading}>{MESSAGES.LABEL.LOADING}</div>
      </div>
    </>
  )
}
