import { GET as getUserCommunities } from '../route'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuthUser } from '@/lib/utils/api-auth'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    community: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    communityMember: {
      findMany: jest.fn(),
    },
    round: {
      findMany: jest.fn(),
    },
  },
  default: {
    community: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    communityMember: {
      findMany: jest.fn(),
    },
    round: {
      findMany: jest.fn(),
    },
  },
}))

jest.mock('@/lib/utils/api-auth', () => ({
  requireAuthUser: jest.fn(),
}))

describe('GET /api/user/communities upcomingRounds unpaginated', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(requireAuthUser as jest.Mock).mockResolvedValue({
      userId: 'user-1',
      error: null,
    })
  })

  it('페이지네이션된 모임 목록(1페이지)에 포함되지 않은 가입 모임의 라운드도 upcomingRounds에 포함되어야 한다', async () => {
    // 1페이지(limit: 1)에는 club-1만 반환됨
    ;(prisma.community.findMany as jest.Mock).mockResolvedValue([
      { clubId: 'club-1', name: '모임 1' },
    ])
    ;(prisma.community.count as jest.Mock).mockResolvedValue(2)

    // 사용자의 전체 가입 모임은 club-1, club-2
    ;(prisma.communityMember.findMany as jest.Mock).mockResolvedValue([
      { clubId: 'club-1' },
      { clubId: 'club-2' },
    ])

    ;(prisma.round.findMany as jest.Mock).mockImplementation(({ where }) => {
      // where.clubId.in 검증
      expect(where.clubId.in).toEqual(expect.arrayContaining(['club-1', 'club-2']))
      return Promise.resolve([
        { roundId: 'round-1', clubId: 'club-1' },
        { roundId: 'round-2', clubId: 'club-2' },
      ])
    })

    const req = new NextRequest('http://localhost:3000/api/user/communities?page=1&limit=1')
    const res = await getUserCommunities(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data.upcomingRounds).toHaveLength(2)
  })
})
