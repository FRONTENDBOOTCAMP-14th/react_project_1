import {
  createNotificationAction,
  deleteNotificationAction,
  updateNotificationAction,
} from '../notifications'
import { getCurrentUserId, hasPermission } from '@/lib/auth'

const mockNotificationFindFirst = jest.fn()
const mockNotificationCreate = jest.fn()
const mockNotificationUpdate = jest.fn()

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  getCurrentUserId: jest.fn(),
  hasPermission: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    notification: {
      findFirst: (...args: unknown[]) => mockNotificationFindFirst(...args),
      create: (...args: unknown[]) => mockNotificationCreate(...args),
      update: (...args: unknown[]) => mockNotificationUpdate(...args),
    },
  },
  default: {
    notification: {
      findFirst: (...args: unknown[]) => mockNotificationFindFirst(...args),
      create: (...args: unknown[]) => mockNotificationCreate(...args),
      update: (...args: unknown[]) => mockNotificationUpdate(...args),
    },
  },
}))

describe('Notifications Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getCurrentUserId as jest.Mock).mockResolvedValue('user-admin')
    ;(hasPermission as jest.Mock).mockResolvedValue(true)
  })

  describe('createNotificationAction', () => {
    it('관리자 권한이 없으면 공지사항 생성을 거부해야 함 (INV-N02)', async () => {
      ;(hasPermission as jest.Mock).mockResolvedValue(false)

      const result = await createNotificationAction({
        clubId: 'club-1',
        title: '새 공지',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('관리자만 공지사항을 등록할 수 있습니다')
      expect(mockNotificationCreate).not.toHaveBeenCalled()
    })

    it('관리자 권한이 있으면 공지사항을 생성해야 함', async () => {
      mockNotificationCreate.mockResolvedValue({ notificationId: 'n-1' })

      const result = await createNotificationAction({
        clubId: 'club-1',
        title: '새 공지',
      })

      expect(result.success).toBe(true)
      expect(mockNotificationCreate).toHaveBeenCalled()
    })
  })

  describe('updateNotificationAction', () => {
    it('작성자도 아니고 관리자도 아니면 수정을 거부해야 함 (INV-N03)', async () => {
      mockNotificationFindFirst.mockResolvedValue({
        notificationId: 'n-1',
        clubId: 'club-1',
        authorId: 'original-author',
      })
      ;(getCurrentUserId as jest.Mock).mockResolvedValue('random-user')
      ;(hasPermission as jest.Mock).mockResolvedValue(false)

      const result = await updateNotificationAction('n-1', {
        title: '수정 시도',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('작성자 또는 관리자만 수정할 수 있습니다')
      expect(mockNotificationUpdate).not.toHaveBeenCalled()
    })

    it('관리자이면 수정을 허용해야 함', async () => {
      mockNotificationFindFirst.mockResolvedValue({
        notificationId: 'n-1',
        clubId: 'club-1',
        authorId: 'original-author',
      })
      ;(getCurrentUserId as jest.Mock).mockResolvedValue('admin-user')
      ;(hasPermission as jest.Mock).mockResolvedValue(true)
      mockNotificationUpdate.mockResolvedValue({ notificationId: 'n-1' })

      const result = await updateNotificationAction('n-1', {
        title: '관리자 수정',
      })

      expect(result.success).toBe(true)
      expect(mockNotificationUpdate).toHaveBeenCalled()
    })
  })

  describe('deleteNotificationAction', () => {
    it('권한이 없으면 삭제를 거부해야 함', async () => {
      mockNotificationFindFirst.mockResolvedValue({
        notificationId: 'n-1',
        clubId: 'club-1',
        authorId: 'author-1',
      })
      ;(getCurrentUserId as jest.Mock).mockResolvedValue('random-user')
      ;(hasPermission as jest.Mock).mockResolvedValue(false)

      const result = await deleteNotificationAction('n-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('작성자 또는 관리자만 삭제할 수 있습니다')
      expect(mockNotificationUpdate).not.toHaveBeenCalled()
    })
  })
})
