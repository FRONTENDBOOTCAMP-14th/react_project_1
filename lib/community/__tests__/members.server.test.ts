import {
  countAdminsInClub,
  createMemberRecord,
  findMemberById,
  findMemberByUserAndClub,
  softDeleteMemberRecord,
  updateMemberRoleRecord,
} from '@/lib/community/members.server'
import prisma from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    communityMember: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  prisma: {
    communityMember: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}))

describe('members.server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findMemberById', () => {
    it('활성 멤버를 ID로 조회해야 함', async () => {
      ;(prisma.communityMember.findFirst as jest.Mock).mockResolvedValue({ id: 'm-1' })
      const res = await findMemberById('m-1')
      expect(res).toEqual({ id: 'm-1' })
      expect(prisma.communityMember.findFirst).toHaveBeenCalledWith({
        where: { id: 'm-1', deletedAt: null },
      })
    })
  })

  describe('findMemberByUserAndClub', () => {
    it('사용자와 클럽 ID로 멤버를 조회해야 함', async () => {
      ;(prisma.communityMember.findFirst as jest.Mock).mockResolvedValue({ id: 'm-1' })
      const res = await findMemberByUserAndClub('user-1', 'club-1')
      expect(res).toEqual({ id: 'm-1' })
      expect(prisma.communityMember.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1', clubId: 'club-1', deletedAt: null },
      })
    })
  })

  describe('createMemberRecord', () => {
    it('멤버 레코드를 생성해야 함', async () => {
      ;(prisma.communityMember.create as jest.Mock).mockResolvedValue({ id: 'm-created' })
      const res = await createMemberRecord({
        clubId: 'club-1',
        userId: 'user-1',
        role: 'member',
      })
      expect(res).toEqual({ id: 'm-created' })
      expect(prisma.communityMember.create).toHaveBeenCalled()
    })
  })

  describe('updateMemberRoleRecord', () => {
    it('멤버 역할을 업데이트해야 함', async () => {
      ;(prisma.communityMember.update as jest.Mock).mockResolvedValue({ id: 'm-1', role: 'admin' })
      const res = await updateMemberRoleRecord('m-1', 'admin')
      expect(res).toEqual({ id: 'm-1', role: 'admin' })
      expect(prisma.communityMember.update).toHaveBeenCalledWith({
        where: { id: 'm-1', deletedAt: null },
        data: { role: 'admin' },
      })
    })
  })

  describe('softDeleteMemberRecord', () => {
    it('deletedAt에 현재 시각을 설정해야 함', async () => {
      ;(prisma.communityMember.update as jest.Mock).mockResolvedValue({ id: 'm-1' })
      await softDeleteMemberRecord('m-1')
      expect(prisma.communityMember.update).toHaveBeenCalledWith({
        where: { id: 'm-1', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      })
    })
  })

  describe('countAdminsInClub', () => {
    it('클럽 내 활성 관리자 수를 반환해야 함', async () => {
      ;(prisma.communityMember.count as jest.Mock).mockResolvedValue(2)
      const count = await countAdminsInClub('club-1')
      expect(count).toBe(2)
      expect(prisma.communityMember.count).toHaveBeenCalledWith({
        where: { clubId: 'club-1', role: 'admin', deletedAt: null },
      })
    })
  })
})
