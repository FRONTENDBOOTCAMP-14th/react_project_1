import prisma from '@/lib/prisma'
import { memberDetailSelect } from '@/lib/queries'
import { MESSAGES } from '@/constants'
import MemberCard from './_components/MemberCard'
import ReactionForm from './_components/ReactionForm'
import ReactionList from './_components/ReactionList'
import styles from './page.module.css'

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const member =
    id.length > 35
      ? await prisma.communityMember.findFirst({
          where: {
            id,
            deletedAt: null,
          },
          select: memberDetailSelect,
        })
      : null

  if (!member) {
    return <div className={styles.empty}>{MESSAGES.ERROR.MEMBER_NOT_FOUND}</div>
  }

  const attendanceCount = await prisma.attendance
    .findMany({
      where: {
        userId: member.user.userId,
        deletedAt: null,
      },
    })
    .then(attendance => attendance.length)

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
