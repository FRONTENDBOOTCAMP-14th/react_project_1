import prisma from '@/lib/prisma'
import { memberDetailSelect } from '@/lib/quaries'
import MemberCard from './_components/MemberCard'
import ReactionForm from './_components/ReactionForm'
import ReactionList from './_components/ReactionList'
import styles from './page.module.css'

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const member =
    id.length > 35
      ? await prisma.communityMember.findUnique({
          where: {
            id,
          },
          select: memberDetailSelect,
        })
      : null

  if (!member) {
    return <div className={styles.empty}>없는 멤버입니다</div>
  }

  const attendanceCount = await prisma.attendance
    .findMany({
      where: {
        userId: member.user.userId,
      },
    })
    .then(attendance => attendance.length)

  console.log(attendanceCount)

  return (
    <div className={styles.container}>
      <MemberCard
        nickname={member.user.nickname || ''}
        role={member.role}
        joinedAt={member.joinedAt}
        attendanceCount={attendanceCount}
      />
      <ReactionForm memberId={member.id} />
      <ReactionList memberId={member.id} />
    </div>
  )
}
