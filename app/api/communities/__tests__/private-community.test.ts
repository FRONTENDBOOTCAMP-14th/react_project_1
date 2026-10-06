import { GET as getCommunityById } from '../[id]/route'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId, hasPermission } from '@/lib/auth'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    community: {
      findUnique: jest.fn(),
    },
  },
  default: {
    community: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  getCurrentUserId: jest.fn(),
  hasPermission: jest.fn(),
}))

describe('Private Community Access Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('비공개 모임에 미인증 사용자가 접근하면 401을 반환해야 한다', async () => {
    ;(prisma.community.findUnique as jest.Mock).mockResolvedValue({
      clubId: 'private-club-1',
      name: '비밀모임',
      isPublic: false,
      deletedAt: null,
      createdAt: new Date(),
    })
    ;(getCurrentUserId as jest.Mock).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/communities/private-club-1')
    const res = await getCommunityById(req, {
      params: Promise.resolve({ id: 'private-club-1' }),
    })

    expect(res.status).toBe(401)
  })

  it('비공개 모임에 비멤버 사용자가 접근하면 403을 반환해야 한다', async () => {
    ;(prisma.community.findUnique as jest.Mock).mockResolvedValue({
      clubId: 'private-club-1',
      name: '비밀모임',
      isPublic: false,
      deletedAt: null,
      createdAt: new Date(),
    })
    ;(getCurrentUserId as jest.Mock).mockResolvedValue('user-stranger')
    ;(hasPermission as jest.Mock).mockResolvedValue(false)

    const req = new NextRequest('http://localhost:3000/api/communities/private-club-1')
    const res = await getCommunityById(req, {
      params: Promise.resolve({ id: 'private-club-1' }),
    })

    expect(res.status).toBe(403)
  })

  it('비공개 모임이라도 가입된 멤버는 정상 200으로 조회되어야 한다', async () => {
    ;(prisma.community.findUnique as jest.Mock).mockResolvedValue({
      clubId: 'private-club-1',
      name: '비밀모임',
      isPublic: false,
      deletedAt: null,
      createdAt: new Date(),
    })
    ;(getCurrentUserId as jest.Mock).mockResolvedValue('user-member')
    ;(hasPermission as jest.Mock).mockResolvedValue(true)

    const req = new NextRequest('http://localhost:3000/api/communities/private-club-1')
    const res = await getCommunityById(req, {
      params: Promise.resolve({ id: 'private-club-1' }),
    })

    expect(res.status).toBe(200)
  })
})
