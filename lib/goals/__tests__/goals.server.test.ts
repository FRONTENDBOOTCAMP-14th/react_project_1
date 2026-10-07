import {
  buildGoalWhereClause,
  createGoal,
  findGoalById,
  softDeleteGoal,
  updateGoal,
} from '@/lib/goals/goals.server'
import prisma from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    studyGoal: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
  prisma: {
    studyGoal: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

describe('goals.server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('buildGoalWhereClause (C-G07)', () => {
    it('기본 where 절을 생성해야 함', () => {
      const where = buildGoalWhereClause({})
      expect(where).toEqual({ deletedAt: null })
    })

    it('필터 파라미터를 적용해야 함', () => {
      const where = buildGoalWhereClause({
        clubId: 'club-1',
        roundId: 'round-1',
        isTeam: true,
        isComplete: false,
        ownerId: 'user-1',
      })

      expect(where).toEqual({
        deletedAt: null,
        clubId: 'club-1',
        roundId: 'round-1',
        isTeam: true,
        isComplete: false,
        ownerId: 'user-1',
      })
    })
  })

  describe('findGoalById', () => {
    it('소프트 삭제되지 않은 목표를 조회해야 함', async () => {
      ;(prisma.studyGoal.findFirst as jest.Mock).mockResolvedValue({ goalId: 'g-1' })
      const goal = await findGoalById('g-1')
      expect(goal).toEqual({ goalId: 'g-1' })
      expect(prisma.studyGoal.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { goalId: 'g-1', deletedAt: null },
        })
      )
    })
  })

  describe('createGoal', () => {
    it('목표를 생성해야 함', async () => {
      ;(prisma.studyGoal.create as jest.Mock).mockResolvedValue({ goalId: 'g-1' })
      const res = await createGoal({
        ownerId: 'user-1',
        clubId: 'club-1',
        roundId: null,
        title: '목표',
        description: null,
        isTeam: true,
        isComplete: false,
        startDate: new Date(),
        endDate: new Date(),
      })
      expect(res).toEqual({ goalId: 'g-1' })
      expect(prisma.studyGoal.create).toHaveBeenCalled()
    })
  })

  describe('updateGoal', () => {
    it('목표를 수정해야 함', async () => {
      ;(prisma.studyGoal.update as jest.Mock).mockResolvedValue({ goalId: 'g-1' })
      const res = await updateGoal('g-1', {
        title: '새제목',
        updatedAt: new Date(),
      })
      expect(res).toEqual({ goalId: 'g-1' })
      expect(prisma.studyGoal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { goalId: 'g-1', deletedAt: null },
          data: expect.objectContaining({ title: '새제목' }),
        })
      )
    })
  })

  describe('softDeleteGoal', () => {
    it('deletedAt에 현재 시각을 설정해야 함', async () => {
      ;(prisma.studyGoal.update as jest.Mock).mockResolvedValue({ goalId: 'g-1' })
      await softDeleteGoal('g-1')
      expect(prisma.studyGoal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { goalId: 'g-1', deletedAt: null },
          data: { deletedAt: expect.any(Date) },
        })
      )
    })
  })
})
