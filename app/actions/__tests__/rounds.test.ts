import { updateRoundAction, deleteRoundAction, markAttendanceAction } from '../rounds'
import { getCurrentUserId } from '@/lib/auth'
import { checkPermission } from '@/lib/utils/serverActions'

const mockRoundFindFirst = jest.fn()
const mockRoundFindUnique = jest.fn()
const mockRoundUpdate = jest.fn()
const mockAttendanceFindFirst = jest.fn()
const mockAttendanceCreate = jest.fn()

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
    attendance: {
      findFirst: (...args: unknown[]) => mockAttendanceFindFirst(...args),
      create: (...args: unknown[]) => mockAttendanceCreate(...args),
    },
  },
  default: {
    round: {
      findFirst: (...args: unknown[]) => mockRoundFindFirst(...args),
      findUnique: (...args: unknown[]) => mockRoundFindUnique(...args),
      update: (...args: unknown[]) => mockRoundUpdate(...args),
    },
    attendance: {
      findFirst: (...args: unknown[]) => mockAttendanceFindFirst(...args),
      create: (...args: unknown[]) => mockAttendanceCreate(...args),
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

  it('deleteRoundAction: 라운드가 요청한 clubId에 속하지 않으면 삭제를 거부해야 한다', async () => {
    mockRoundFindFirst.mockResolvedValue(null)

    const result = await deleteRoundAction('round-b-id', 'club-a-id')

    expect(result.success).toBe(false)
    expect(mockRoundUpdate).not.toHaveBeenCalled()
  })

  it('markAttendanceAction: 라운드가 요청한 clubId에 속하지 않으면 출석을 거부해야 한다', async () => {
    mockAttendanceFindFirst.mockResolvedValue(null)
    mockRoundFindFirst.mockResolvedValue(null)

    const result = await markAttendanceAction('round-b-id', 'club-a-id')

    expect(result.success).toBe(false)
    expect(mockAttendanceCreate).not.toHaveBeenCalled()
  })
})
