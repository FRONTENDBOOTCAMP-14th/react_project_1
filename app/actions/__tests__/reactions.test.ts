import { createReactionAction, deleteReactionAction, updateReactionAction } from '../reactions'
import { getCurrentUserId } from '@/lib/auth'

const mockMemberFindFirst = jest.fn()
const mockReactionFindFirst = jest.fn()
const mockReactionCreate = jest.fn()
const mockReactionUpdate = jest.fn()

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  getCurrentUserId: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    communityMember: {
      findFirst: (...args: unknown[]) => mockMemberFindFirst(...args),
    },
    reaction: {
      findFirst: (...args: unknown[]) => mockReactionFindFirst(...args),
      create: (...args: unknown[]) => mockReactionCreate(...args),
      update: (...args: unknown[]) => mockReactionUpdate(...args),
    },
  },
  default: {
    communityMember: {
      findFirst: (...args: unknown[]) => mockMemberFindFirst(...args),
    },
    reaction: {
      findFirst: (...args: unknown[]) => mockReactionFindFirst(...args),
      create: (...args: unknown[]) => mockReactionCreate(...args),
      update: (...args: unknown[]) => mockReactionUpdate(...args),
    },
  },
}))

describe('Reactions Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getCurrentUserId as jest.Mock).mockResolvedValue('user-1')
  })

  describe('createReactionAction', () => {
    it('인증되지 않은 사용자의 요청은 실패해야 함', async () => {
      ;(getCurrentUserId as jest.Mock).mockResolvedValue(null)

      const result = await createReactionAction({
        memberId: 'm-1',
        reaction: '👍',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('인증이 필요합니다')
    })

    it('멤버가 존재하지 않으면 실패해야 함', async () => {
      mockMemberFindFirst.mockResolvedValue(null)

      const result = await createReactionAction({
        memberId: 'm-not-found',
        reaction: '👍',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('멤버를 찾을 수 없습니다')
      expect(mockReactionCreate).not.toHaveBeenCalled()
    })

    it('유효한 요청이면 리액션을 생성해야 함', async () => {
      mockMemberFindFirst.mockResolvedValue({ id: 'm-1', clubId: 'club-1' })
      mockReactionCreate.mockResolvedValue({ reactionId: 'rc-1' })

      const result = await createReactionAction({
        memberId: 'm-1',
        reaction: '👍',
      })

      expect(result.success).toBe(true)
      expect(mockReactionCreate).toHaveBeenCalled()
    })
  })

  describe('updateReactionAction', () => {
    it('작성자가 아니면 수정을 거부해야 함 (INV-RC02)', async () => {
      mockReactionFindFirst.mockResolvedValue({
        reactionId: 'rc-1',
        userId: 'other-user',
      })

      const result = await updateReactionAction('rc-1', {
        reaction: '❤️',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('본인의 리액션만 수정/삭제할 수 있습니다')
      expect(mockReactionUpdate).not.toHaveBeenCalled()
    })

    it('작성자 본인이면 수정을 허용해야 함', async () => {
      mockReactionFindFirst.mockResolvedValue({
        reactionId: 'rc-1',
        userId: 'user-1',
        community_members: { clubId: 'club-1' },
      })
      mockReactionUpdate.mockResolvedValue({ reactionId: 'rc-1' })

      const result = await updateReactionAction('rc-1', {
        reaction: '❤️',
      })

      expect(result.success).toBe(true)
      expect(mockReactionUpdate).toHaveBeenCalled()
    })
  })

  describe('deleteReactionAction', () => {
    it('작성자가 아니면 삭제를 거부해야 함 (INV-RC02)', async () => {
      mockReactionFindFirst.mockResolvedValue({
        reactionId: 'rc-1',
        userId: 'other-user',
      })

      const result = await deleteReactionAction('rc-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('본인의 리액션만 수정/삭제할 수 있습니다')
      expect(mockReactionUpdate).not.toHaveBeenCalled()
    })
  })
})
