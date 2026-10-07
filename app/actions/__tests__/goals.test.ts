import { createGoalAction, updateGoalAction, deleteGoalAction } from '../goals'
import { getCurrentUserId } from '@/lib/auth'

const mockGoalFindFirst = jest.fn()
const mockGoalCreate = jest.fn()
const mockGoalUpdate = jest.fn()

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  getCurrentUserId: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    studyGoal: {
      findFirst: (...args: unknown[]) => mockGoalFindFirst(...args),
      create: (...args: unknown[]) => mockGoalCreate(...args),
      update: (...args: unknown[]) => mockGoalUpdate(...args),
    },
  },
  default: {
    studyGoal: {
      findFirst: (...args: unknown[]) => mockGoalFindFirst(...args),
      create: (...args: unknown[]) => mockGoalCreate(...args),
      update: (...args: unknown[]) => mockGoalUpdate(...args),
    },
  },
}))

describe('Goals Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getCurrentUserId as jest.Mock).mockResolvedValue('user-1')
  })

  describe('createGoalAction (C-G08)', () => {
    it('인증되지 않은 사용자의 요청은 실패해야 한다', async () => {
      ;(getCurrentUserId as jest.Mock).mockResolvedValue(null)

      const result = await createGoalAction({
        title: '목표',
        startDate: '2026-10-07T10:00:00Z',
        endDate: '2026-10-07T12:00:00Z',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('인증이 필요합니다')
    })

    it('시작일이 종료일보다 늦으면 생성을 거부해야 한다 (INV-G01)', async () => {
      const result = await createGoalAction({
        title: '목표',
        startDate: '2026-10-07T15:00:00Z',
        endDate: '2026-10-07T10:00:00Z',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('종료 시간은 시작 시간 이후여야 합니다')
      expect(mockGoalCreate).not.toHaveBeenCalled()
    })

    it('유효한 입력이면 목표를 생성하고 성공해야 한다', async () => {
      mockGoalCreate.mockResolvedValue({ goalId: 'goal-1', title: '목표' })

      const result = await createGoalAction({
        title: '정상 목표',
        startDate: '2026-10-07T10:00:00Z',
        endDate: '2026-10-07T12:00:00Z',
      })

      expect(result.success).toBe(true)
      expect(mockGoalCreate).toHaveBeenCalled()
    })
  })

  describe('updateGoalAction', () => {
    it('다른 사용자의 목표 수정 시도는 거부해야 한다 (INV-G04)', async () => {
      mockGoalFindFirst.mockResolvedValue({
        goalId: 'goal-1',
        ownerId: 'other-user',
        startDate: new Date('2026-10-07T10:00:00Z'),
        endDate: new Date('2026-10-07T12:00:00Z'),
      })

      const result = await updateGoalAction('goal-1', { title: '변조 시도' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('목표 소유자만 수정할 수 있습니다')
      expect(mockGoalUpdate).not.toHaveBeenCalled()
    })

    it('startDate 단독 수정 시 기존 endDate를 초과하면 거부해야 한다 (INV-G02)', async () => {
      mockGoalFindFirst.mockResolvedValue({
        goalId: 'goal-1',
        ownerId: 'user-1',
        startDate: new Date('2026-10-07T10:00:00Z'),
        endDate: new Date('2026-10-07T12:00:00Z'),
      })

      const result = await updateGoalAction('goal-1', {
        startDate: '2026-10-07T13:00:00Z',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('종료 시간은 시작 시간 이후여야 합니다')
      expect(mockGoalUpdate).not.toHaveBeenCalled()
    })
  })

  describe('deleteGoalAction', () => {
    it('다른 사용자의 목표 삭제 시도는 거부해야 한다 (INV-G04)', async () => {
      mockGoalFindFirst.mockResolvedValue({
        goalId: 'goal-1',
        ownerId: 'other-user',
      })

      const result = await deleteGoalAction('goal-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('목표 소유자만 삭제할 수 있습니다')
      expect(mockGoalUpdate).not.toHaveBeenCalled()
    })
  })
})
