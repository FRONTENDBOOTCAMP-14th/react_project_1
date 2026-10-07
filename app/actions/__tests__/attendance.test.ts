import { markAttendanceAction } from '../attendance'
import { getCurrentUserId } from '@/lib/auth'
import { checkPermission } from '@/lib/utils/serverActions'

const mockRoundFindFirst = jest.fn()
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
    },
    attendance: {
      findFirst: (...args: unknown[]) => mockAttendanceFindFirst(...args),
      create: (...args: unknown[]) => mockAttendanceCreate(...args),
    },
  },
  default: {
    round: {
      findFirst: (...args: unknown[]) => mockRoundFindFirst(...args),
    },
    attendance: {
      findFirst: (...args: unknown[]) => mockAttendanceFindFirst(...args),
      create: (...args: unknown[]) => mockAttendanceCreate(...args),
    },
  },
}))

describe('Attendance Actions IDOR & Permission', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getCurrentUserId as jest.Mock).mockResolvedValue('user-admin-a')
    ;(checkPermission as jest.Mock).mockResolvedValue(undefined)
  })

  it('markAttendanceAction: 라운드가 요청한 clubId에 속하지 않으면 출석을 거부해야 한다', async () => {
    mockAttendanceFindFirst.mockResolvedValue(null)
    mockRoundFindFirst.mockResolvedValue(null)

    const result = await markAttendanceAction('round-b-id', 'club-a-id')

    expect(result.success).toBe(false)
    expect(mockAttendanceCreate).not.toHaveBeenCalled()
  })

  it('markAttendanceAction: 라운드 시간 내 미출석 상태이면 출석 생성을 수행해야 한다', async () => {
    const now = new Date()
    const startDate = new Date(now.getTime() - 1000 * 60 * 30) // 30분 전
    const endDate = new Date(now.getTime() + 1000 * 60 * 30) // 30분 후

    mockAttendanceFindFirst.mockResolvedValue(null)
    mockRoundFindFirst.mockResolvedValue({
      roundId: 'round-1',
      clubId: 'club-a-id',
      startDate,
      endDate,
    })
    mockAttendanceCreate.mockResolvedValue({
      attendanceId: 'att-1',
    })

    const result = await markAttendanceAction('round-1', 'club-a-id')

    expect(result.success).toBe(true)
    expect(mockAttendanceCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          round: { connect: { roundId: 'round-1' } },
          user: { connect: { userId: 'user-admin-a' } },
          attendanceType: 'present',
        }),
      })
    )
  })

  it('markAttendanceAction: 이미 출석한 상태이면 출석을 거부해야 한다', async () => {
    mockAttendanceFindFirst.mockResolvedValue({ attendanceId: 'existing-att' })
    mockRoundFindFirst.mockResolvedValue({
      roundId: 'round-1',
      clubId: 'club-a-id',
      startDate: new Date(),
      endDate: new Date(),
    })

    const result = await markAttendanceAction('round-1', 'club-a-id')

    expect(result.success).toBe(false)
    expect(result.error).toBe('이미 출석 처리되었습니다')
    expect(mockAttendanceCreate).not.toHaveBeenCalled()
  })
})
