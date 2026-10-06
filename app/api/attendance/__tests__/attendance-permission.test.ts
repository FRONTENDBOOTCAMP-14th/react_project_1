import { POST as createAttendance } from '../route'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuthUser } from '@/lib/utils/api-auth'
import { getUserRole } from '@/lib/auth'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    round: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    attendance: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
  default: {
    round: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    attendance: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/utils/api-auth', () => ({
  requireAuthUser: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  getUserRole: jest.fn(),
}))

describe('POST /api/attendance Non-member Permission Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(requireAuthUser as jest.Mock).mockResolvedValue({
      userId: 'user-stranger-id',
      error: null,
    })
  })

  it('모임 멤버가 아닌 사용자가 본인 명의로 출석을 등록하려고 하면 403을 반환해야 한다', async () => {
    ;(prisma.round.findUnique as jest.Mock).mockResolvedValue({
      roundId: 'round-1',
      clubId: 'club-1',
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      userId: 'user-stranger-id',
    })
    // 모임에 가입되어 있지 않음
    ;(getUserRole as jest.Mock).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roundId: 'round-1',
        userId: 'user-stranger-id',
        attendanceType: 'present',
      }),
    })

    const res = await createAttendance(req)

    expect(res.status).toBe(403)
    expect(prisma.attendance.create).not.toHaveBeenCalled()
  })

  it('관리자가 모임 멤버가 아닌 타인을 대리 출석 등록하려고 하면 400을 반환해야 한다', async () => {
    ;(requireAuthUser as jest.Mock).mockResolvedValue({
      userId: 'admin-user-id',
      error: null,
    })
    ;(prisma.round.findUnique as jest.Mock).mockResolvedValue({
      roundId: 'round-1',
      clubId: 'club-1',
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      userId: 'target-non-member-id',
    })
    // 호출자(관리자)는 admin, 대상 사용자는 null
    ;(getUserRole as jest.Mock).mockImplementation((userId: string, _clubId: string) => {
      if (userId === 'admin-user-id') {
        return Promise.resolve({ role: 'admin' })
      }
      return Promise.resolve(null)
    })

    const req = new NextRequest('http://localhost:3000/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roundId: 'round-1',
        userId: 'target-non-member-id',
        attendanceType: 'present',
      }),
    })

    const res = await createAttendance(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('해당 모임의 멤버만 출석을 등록할 수 있습니다.')
    expect(prisma.attendance.create).not.toHaveBeenCalled()
  })
})
