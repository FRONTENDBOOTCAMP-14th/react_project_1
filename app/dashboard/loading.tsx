import { MESSAGES } from '@/constants'
import { DashboardLayout } from './_components'

export default function DashboardLoading() {
  return (
    <DashboardLayout title={MESSAGES.LOADING.DEFAULT} emptyMessage="" isEmpty={false}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <div>{MESSAGES.LOADING.STUDY_LIST}</div>
      </div>
    </DashboardLayout>
  )
}
