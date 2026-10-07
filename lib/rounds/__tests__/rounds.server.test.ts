import {
  buildRoundWhereClause,
  createRound,
  findRoundById,
  getNextRoundNumber,
  softDeleteRound,
  updateRound,
} from '@/lib/rounds/rounds.server'
import prisma from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    round: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('rounds.server', () => {
  const CLUB_ID = 'test-club-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('buildRoundWhereClause', () => {
    it('기본 where 절을 생성해야 함', () => {
      const whereClause = buildRoundWhereClause(CLUB_ID)
      expect(whereClause).toEqual({
        deletedAt: null,
        clubId: CLUB_ID,
      })
    })

    it('roundNumber 필터를 적용해야 함', () => {
      const whereClause = buildRoundWhereClause(CLUB_ID, {
        roundNumber: '3',
      })
      expect(whereClause).toEqual({
        deletedAt: null,
        clubId: CLUB_ID,
        roundNumber: 3,
      })
    })

    it('날짜 필터들을 조합하여 AND 조건으로 생성해야 함', () => {
      const startDate = '2026-10-01T00:00:00Z'
      const endDate = '2026-10-02T00:00:00Z'
      const whereClause = buildRoundWhereClause(CLUB_ID, {
        startDateFrom: startDate,
        endDateTo: endDate,
      })

      expect(whereClause.clubId).toBe(CLUB_ID)
      expect(whereClause.AND).toHaveLength(2)
    })
  })

  describe('getNextRoundNumber', () => {
    it('마지막 라운드가 없으면 1을 반환해야 함', async () => {
      ;(prisma.round.findFirst as jest.Mock).mockResolvedValue(null)
      const nextNumber = await getNextRoundNumber(CLUB_ID)
      expect(nextNumber).toBe(1)
    })

    it('마지막 라운드가 있으면 roundNumber + 1을 반환해야 함', async () => {
      ;(prisma.round.findFirst as jest.Mock).mockResolvedValue({ roundNumber: 5 })
      const nextNumber = await getNextRoundNumber(CLUB_ID)
      expect(nextNumber).toBe(6)
    })
  })

  describe('I/O 함수들 (find, create, update, softDelete)', () => {
    it('findRoundById: clubId와 deletedAt: null 필터로 단건 조회해야 함', async () => {
      ;(prisma.round.findFirst as jest.Mock).mockResolvedValue({ roundId: 'r-1' })
      const round = await findRoundById('r-1', CLUB_ID)
      expect(round).toEqual({ roundId: 'r-1' })
      expect(prisma.round.findFirst).toHaveBeenCalledWith({
        where: { roundId: 'r-1', clubId: CLUB_ID, deletedAt: null },
      })
    })

    it('createRound: 입력 데이터로 라운드를 생성해야 함', async () => {
      ;(prisma.round.create as jest.Mock).mockResolvedValue({ roundId: 'r-created' })
      const res = await createRound({
        clubId: CLUB_ID,
        roundNumber: 1,
        startDate: null,
        endDate: null,
        location: null,
      })
      expect(res).toEqual({ roundId: 'r-created' })
      expect(prisma.round.create).toHaveBeenCalled()
    })

    it('updateRound: 라운드 정보를 업데이트해야 함', async () => {
      ;(prisma.round.update as jest.Mock).mockResolvedValue({ roundId: 'r-1' })
      const res = await updateRound('r-1', { location: '강남' })
      expect(res).toEqual({ roundId: 'r-1' })
      expect(prisma.round.update).toHaveBeenCalledWith({
        where: { roundId: 'r-1' },
        data: { location: '강남' },
      })
    })

    it('softDeleteRound: deletedAt에 현재 시간을 설정해야 함', async () => {
      ;(prisma.round.update as jest.Mock).mockResolvedValue({ roundId: 'r-1' })
      await softDeleteRound('r-1')
      expect(prisma.round.update).toHaveBeenCalledWith({
        where: { roundId: 'r-1', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      })
    })
  })
})
