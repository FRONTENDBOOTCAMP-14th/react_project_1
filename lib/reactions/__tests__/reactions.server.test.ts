import {
  buildReactionWhereClause,
  createReaction,
  findReactionById,
  softDeleteReaction,
  updateReaction,
} from '@/lib/reactions/reactions.server'
import prisma from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    reaction: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
  prisma: {
    reaction: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('reactions.server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('buildReactionWhereClause', () => {
    it('memberId와 userId 필터를 구성해야 함', () => {
      const where = buildReactionWhereClause('member-1', 'user-1')
      expect(where).toEqual({
        deletedAt: null,
        member_id: 'member-1',
        userId: 'user-1',
      })
    })

    it('memberId만 지정된 경우 member_id만 포함해야 함', () => {
      const where = buildReactionWhereClause('member-1')
      expect(where).toEqual({
        deletedAt: null,
        member_id: 'member-1',
      })
    })

    it('userId만 지정된 경우 userId만 포함해야 함', () => {
      const where = buildReactionWhereClause(undefined, 'user-1')
      expect(where).toEqual({
        deletedAt: null,
        userId: 'user-1',
      })
    })
  })

  describe('findReactionById', () => {
    it('활성 리액션을 단건 조회해야 함', async () => {
      ;(prisma.reaction.findFirst as jest.Mock).mockResolvedValue({ reactionId: 'rc-1' })
      const res = await findReactionById('rc-1')
      expect(res).toEqual({ reactionId: 'rc-1' })
      expect(prisma.reaction.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { reactionId: 'rc-1', deletedAt: null },
        })
      )
    })
  })

  describe('createReaction', () => {
    it('리액션을 생성해야 함', async () => {
      ;(prisma.reaction.create as jest.Mock).mockResolvedValue({ reactionId: 'rc-1' })
      const res = await createReaction({
        userId: 'user-1',
        memberId: 'member-1',
        reaction: '👍',
      })
      expect(res).toEqual({ reactionId: 'rc-1' })
      expect(prisma.reaction.create).toHaveBeenCalled()
    })
  })

  describe('updateReaction', () => {
    it('리액션을 수정해야 함', async () => {
      ;(prisma.reaction.update as jest.Mock).mockResolvedValue({ reactionId: 'rc-1' })
      const res = await updateReaction('rc-1', { reaction: '❤️' })
      expect(res).toEqual({ reactionId: 'rc-1' })
      expect(prisma.reaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { reactionId: 'rc-1', deletedAt: null },
          data: { reaction: '❤️' },
        })
      )
    })
  })

  describe('softDeleteReaction', () => {
    it('deletedAt에 현재 시각을 설정해야 함', async () => {
      ;(prisma.reaction.update as jest.Mock).mockResolvedValue({ reactionId: 'rc-1' })
      await softDeleteReaction('rc-1')
      expect(prisma.reaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { reactionId: 'rc-1', deletedAt: null },
          data: { deletedAt: expect.any(Date) },
        })
      )
    })
  })
})
