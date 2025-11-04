import { DashboardLayout } from './_components'

export default function DashboardLoading() {
  return (
    <DashboardLayout title="로딩 중..." emptyMessage="" isEmpty={false}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <div>스터디 목록을 불러오는 중입니다...</div>
      </div>
    </DashboardLayout>
  )
}
