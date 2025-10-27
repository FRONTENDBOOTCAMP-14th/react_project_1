import NotificationItem from './NotificationItem'

const notifications = [
  {
    id: 1,
    name: 'michel',
    message: '님이 회원님을 응원합니다',
    image: '/svg/logo.svg',
  },
  {
    id: 2,
    name: '회원',
    message: '님의 스터디가 30분 남았습니다',
    image: '/svg/logo.svg',
  },
]

export default function NotificationList() {
  return (
    <div role="list">
      {notifications.map(n => (
        <NotificationItem key={n.id} {...n} />
      ))}
    </div>
  )
}
