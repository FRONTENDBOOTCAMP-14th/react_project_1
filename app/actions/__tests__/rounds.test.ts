import { updateRoundAction, deleteRoundAction } from '../rounds'
import { getCurrentUserId } from '@/lib/auth'
import { checkPermission } from '@/lib/utils/serverActions'

const mockRoundFindFirst = jest.fn()
const mockRoundFindUnique = jest.fn()
const mockRoundUpdate = jest.fn()

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  getCurrentUserId: jest.fn(),
}))

jest.mock('@/lib/utils/serverActions', () => {
  const actual = jest.requireActual('@/lib/utils/serverActions')
  return {
    ...actual,
    checkPermission: jest.fn(),
  }
})

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    round: {
      findFirst: (...args: unknown[]) => mockRoundFindFirst(...args),
      findUnique: (...args: unknown[]) => mockRoundFindUnique(...args),
      update: (...args: unknown[]) => mockRoundUpdate(...args),
    },
  },
  default: {
    round: {
      findFirst: (...args: unknown[]) => mockRoundFindFirst(...args),
      findUnique: (...args: unknown[]) => mockRoundFindUnique(...args),
      update: (...args: unknown[]) => mockRoundUpdate(...args),
    },
  },
}))

describe('Rounds IDOR Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getCurrentUserId as jest.Mock).mockResolvedValue('user-admin-a')
    ;(checkPermission as jest.Mock).mockResolvedValue(undefined) // clubA 관리자 권한 통과
  })

  it('updateRoundAction: 라운드가 요청한 clubId에 속하지 않으면 업데이트를 거부해야 한다', async () => {
    // roundId는 clubB 소속이므로 clubA로 조회 시 null 반환
    mockRoundFindFirst.mockResolvedValue(null)

    const result = await updateRoundAction('round-b-id', 'club-a-id', { location: '공격' })

    expect(result.success).toBe(false)
    expect(mockRoundUpdate).not.toHaveBeenCalled()
  })

  it('updateRoundAction: startDate 단독 수정 시 기존 endDate보다 늦으면 업데이트를 거부해야 한다 (Finding 2)', async () => {
    mockRoundFindFirst.mockResolvedValue({
      roundId: 'round-1',
      clubId: 'club-a-id',
      startDate: new Date('2026-10-07T10:00:00Z'),
      endDate: new Date('2026-10-07T12:00:00Z'),
    })

    const result = await updateRoundAction('round-1', 'club-a-id', {
      startDate: '2026-10-07T13:00:00Z',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('종료 시간은 시작 시간 이후여야 합니다')
    expect(mockRoundUpdate).not.toHaveBeenCalled()
  })

  it('deleteRoundAction: 라운드가 요청한 clubId에 속하지 않으면 삭제를 거부해야 한다', async () => {
    mockRoundFindFirst.mockResolvedValue(null)

    const result = await deleteRoundAction('round-b-id', 'club-a-id')

    expect(result.success).toBe(false)
    expect(mockRoundUpdate).not.toHaveBeenCalled()
  })
})
