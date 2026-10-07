import {
  buildNotificationWhereClause,
  createNotification,
  findNotificationById,
  softDeleteNotification,
  updateNotification,
} from '@/lib/notifications/notifications.server'
import prisma from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    notification: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
  prisma: {
    notification: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('notifications.server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('buildNotificationWhereClause', () => {
    it('기본 where 절을 생성해야 함', () => {
      const where = buildNotificationWhereClause('club-1')
      expect(where).toEqual({
        deletedAt: null,
        clubId: 'club-1',
      })
    })

    it('isPinned 필터를 적용해야 함', () => {
      const where = buildNotificationWhereClause('club-1', { isPinned: true })
      expect(where).toEqual({
        deletedAt: null,
        clubId: 'club-1',
        isPinned: true,
      })
    })
  })

  describe('findNotificationById', () => {
    it('활성 공지사항을 단건 조회해야 함', async () => {
      ;(prisma.notification.findFirst as jest.Mock).mockResolvedValue({ notificationId: 'n-1' })
      const res = await findNotificationById('n-1')
      expect(res).toEqual({ notificationId: 'n-1' })
      expect(prisma.notification.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { notificationId: 'n-1', deletedAt: null },
        })
      )
    })
  })

  describe('createNotification', () => {
    it('공지사항을 생성해야 함', async () => {
      ;(prisma.notification.create as jest.Mock).mockResolvedValue({ notificationId: 'n-1' })
      const res = await createNotification({
        clubId: 'club-1',
        authorId: 'user-1',
        title: '제목',
        content: '내용',
        isPinned: false,
      })
      expect(res).toEqual({ notificationId: 'n-1' })
      expect(prisma.notification.create).toHaveBeenCalled()
    })
  })

  describe('updateNotification', () => {
    it('공지사항을 업데이트해야 함', async () => {
      ;(prisma.notification.update as jest.Mock).mockResolvedValue({ notificationId: 'n-1' })
      const res = await updateNotification('n-1', { title: '새제목', updatedAt: new Date() })
      expect(res).toEqual({ notificationId: 'n-1' })
      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { notificationId: 'n-1', deletedAt: null },
        })
      )
    })
  })

  describe('softDeleteNotification', () => {
    it('deletedAt에 현재 시각을 설정해야 함', async () => {
      ;(prisma.notification.update as jest.Mock).mockResolvedValue({ notificationId: 'n-1' })
      await softDeleteNotification('n-1')
      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { notificationId: 'n-1', deletedAt: null },
          data: { deletedAt: expect.any(Date) },
        })
      )
    })
  })
})
