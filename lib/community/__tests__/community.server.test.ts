import {
  buildCommunityWhereClause,
  createCommunityWithAdmin,
  findCommunityById,
  softDeleteCommunity,
  updateCommunity,
} from '@/lib/community/community.server'
import prisma from '@/lib/prisma'

const mockTx = {
  community: {
    create: jest.fn(),
  },
  communityMember: {
    create: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn((callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx)),
    community: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
  prisma: {
    $transaction: jest.fn((callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx)),
    community: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('community.server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('buildCommunityWhereClause', () => {
    it('기본 where 조건을 생성해야 함', () => {
      const where = buildCommunityWhereClause({})
      expect(where).toEqual({ deletedAt: null })
    })

    it('필터 파라미터를 적용해야 함', () => {
      const where = buildCommunityWhereClause({
        isPublic: true,
        region: '서울',
        subRegion: '강남구',
        search: '러닝',
      })

      expect(where.isPublic).toBe(true)
      expect(where.region).toBe('서울')
      expect(where.subRegion).toBe('강남구')
      expect(where.name).toEqual({ contains: '러닝', mode: 'insensitive' })
    })

    it('유효한 createdAfter/createdBefore 날짜를 적용해야 함', () => {
      const where = buildCommunityWhereClause({
        createdAfter: '2026-01-01T00:00:00Z',
        createdBefore: '2026-12-31T23:59:59Z',
      })

      expect(where.createdAt).toEqual({
        gte: new Date('2026-01-01T00:00:00Z'),
        lte: new Date('2026-12-31T23:59:59Z'),
      })
    })

    it('유효하지 않은 createdAfter/createdBefore 입력 시 createdAt 조건을 생성하지 않아야 함 (Finding 2)', () => {
      const where = buildCommunityWhereClause({
        createdAfter: 'invalid-date',
        createdBefore: 'not-a-date',
      })

      expect(where.createdAt).toBeUndefined()
      expect(where.deletedAt).toBeNull()
    })
  })

  describe('createCommunityWithAdmin', () => {
    it('트랜잭션으로 커뮤니티와 admin 멤버를 생성해야 함', async () => {
      mockTx.community.create.mockResolvedValue({ clubId: 'club-1', name: '테스트 모임' })
      mockTx.communityMember.create.mockResolvedValue({ id: 'member-1' })

      const res = await createCommunityWithAdmin(
        {
          name: '테스트 모임',
          description: null,
          isPublic: true,
          region: null,
          subRegion: null,
          tagname: [],
          imageUrl: null,
        },
        'user-admin'
      )

      expect(res).toEqual({ clubId: 'club-1', name: '테스트 모임' })
      expect(mockTx.community.create).toHaveBeenCalled()
      expect(mockTx.communityMember.create).toHaveBeenCalledWith({
        data: {
          clubId: 'club-1',
          userId: 'user-admin',
          role: 'admin',
        },
      })
    })
  })

  describe('findCommunityById', () => {
    it('커뮤니티를 단건 조회해야 함', async () => {
      ;(prisma.community.findFirst as jest.Mock).mockResolvedValue({ clubId: 'club-1' })
      const res = await findCommunityById('club-1')
      expect(res).toEqual({ clubId: 'club-1' })
    })
  })

  describe('updateCommunity', () => {
    it('커뮤니티 정보를 업데이트해야 함', async () => {
      ;(prisma.community.update as jest.Mock).mockResolvedValue({ clubId: 'club-1' })
      const res = await updateCommunity('club-1', { name: '새이름' })
      expect(res).toEqual({ clubId: 'club-1' })
      expect(prisma.community.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clubId: 'club-1', deletedAt: null },
          data: { name: '새이름' },
        })
      )
    })
  })

  describe('softDeleteCommunity', () => {
    it('deletedAt에 현재 시각을 설정해야 함', async () => {
      ;(prisma.community.update as jest.Mock).mockResolvedValue({ clubId: 'club-1' })
      await softDeleteCommunity('club-1')
      expect(prisma.community.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clubId: 'club-1', deletedAt: null },
          data: { deletedAt: expect.any(Date) },
        })
      )
    })
  })
})
