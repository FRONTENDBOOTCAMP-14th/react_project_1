import { GET as getNotifications } from '../route'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId, hasPermission } from '@/lib/auth'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    community: {
      findFirst: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
  default: {
    community: {
      findFirst: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  getCurrentUserId: jest.fn(),
  hasPermission: jest.fn(),
}))

describe('Notifications Private Community Access Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('비공개 모임의 공지사항에 미인증 사용자가 접근하면 401을 반환해야 한다', async () => {
    ;(prisma.community.findFirst as jest.Mock).mockResolvedValue({
      isPublic: false,
    })
    ;(getCurrentUserId as jest.Mock).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/notifications?clubId=private-club-1')
    const res = await getNotifications(req)

    expect(res.status).toBe(401)
  })

  it('비공개 모임의 공지사항에 비멤버 사용자가 접근하면 403을 반환해야 한다', async () => {
    ;(prisma.community.findFirst as jest.Mock).mockResolvedValue({
      isPublic: false,
    })
    ;(getCurrentUserId as jest.Mock).mockResolvedValue('user-stranger')
    ;(hasPermission as jest.Mock).mockResolvedValue(false)

    const req = new NextRequest('http://localhost:3000/api/notifications?clubId=private-club-1')
    const res = await getNotifications(req)

    expect(res.status).toBe(403)
  })
})
