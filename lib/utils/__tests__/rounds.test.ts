/**
 * rounds.ts 유틸리티 테스트
 */

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    round: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}))

import { buildRoundWhereClause, createPaginationInfo } from '../rounds'

describe('rounds utilities', () => {
  describe('buildRoundWhereClause', () => {
    const CLUB_ID = 'test-club-id'

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

    it('startDateFrom 필터를 적용해야 함', () => {
      const startDate = '2024-01-01T00:00:00Z'
      const whereClause = buildRoundWhereClause(CLUB_ID, {
        startDateFrom: startDate,
      })

      expect(whereClause).toMatchObject({
        deletedAt: null,
        clubId: CLUB_ID,
        AND: [
          {
            startDate: {
              gte: new Date(startDate),
            },
          },
        ],
      })
    })

    it('startDateTo 필터를 적용해야 함', () => {
      const startDate = '2024-01-31T23:59:59Z'
      const whereClause = buildRoundWhereClause(CLUB_ID, {
        startDateTo: startDate,
      })

      expect(whereClause).toMatchObject({
        deletedAt: null,
        clubId: CLUB_ID,
        AND: [
          {
            startDate: {
              lte: new Date(startDate),
            },
          },
        ],
      })
    })

    it('endDateFrom 필터를 적용해야 함', () => {
      const endDate = '2024-01-15T00:00:00Z'
      const whereClause = buildRoundWhereClause(CLUB_ID, {
        endDateFrom: endDate,
      })

      expect(whereClause).toMatchObject({
        deletedAt: null,
        clubId: CLUB_ID,
        AND: [
          {
            endDate: {
              gte: new Date(endDate),
            },
          },
        ],
      })
    })

    it('endDateTo 필터를 적용해야 함', () => {
      const endDate = '2024-01-31T23:59:59Z'
      const whereClause = buildRoundWhereClause(CLUB_ID, {
        endDateTo: endDate,
      })

      expect(whereClause).toMatchObject({
        deletedAt: null,
        clubId: CLUB_ID,
        AND: [
          {
            endDate: {
              lte: new Date(endDate),
            },
          },
        ],
      })
    })

    it('여러 필터를 동시에 적용해야 함', () => {
      const whereClause = buildRoundWhereClause(CLUB_ID, {
        roundNumber: '5',
        startDateFrom: '2024-01-01T00:00:00Z',
        startDateTo: '2024-01-31T23:59:59Z',
      })

      expect(whereClause).toMatchObject({
        deletedAt: null,
        clubId: CLUB_ID,
        roundNumber: 5,
        AND: expect.arrayContaining([
          expect.objectContaining({
            startDate: expect.any(Object),
          }),
        ]),
      })
      expect(whereClause.AND).toHaveLength(2)
    })

    it('모든 날짜 필터를 동시에 적용해야 함', () => {
      const whereClause = buildRoundWhereClause(CLUB_ID, {
        startDateFrom: '2024-01-01T00:00:00Z',
        startDateTo: '2024-01-31T23:59:59Z',
        endDateFrom: '2024-01-15T00:00:00Z',
        endDateTo: '2024-02-15T23:59:59Z',
      })

      expect(whereClause.AND).toHaveLength(4)
      expect(whereClause).toMatchObject({
        deletedAt: null,
        clubId: CLUB_ID,
      })
    })

    it('빈 필터는 무시해야 함', () => {
      const whereClause = buildRoundWhereClause(CLUB_ID, {
        roundNumber: null,
        startDateFrom: null,
        startDateTo: null,
        endDateFrom: null,
        endDateTo: null,
      })

      expect(whereClause).toEqual({
        deletedAt: null,
        clubId: CLUB_ID,
      })
    })

    it('roundNumber 문자열을 숫자로 변환해야 함', () => {
      const whereClause = buildRoundWhereClause(CLUB_ID, {
        roundNumber: '10',
      })

      expect(whereClause.roundNumber).toBe(10)
      expect(typeof whereClause.roundNumber).toBe('number')
    })
  })

  describe('createPaginationInfo', () => {
    it('페이지네이션 정보를 생성해야 함', () => {
      const info = createPaginationInfo(1, 10, 100)

      expect(info).toEqual({
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
      })
    })

    it('총 페이지 수를 올림으로 계산해야 함', () => {
      const info = createPaginationInfo(1, 10, 95)

      expect(info.totalPages).toBe(10) // 95 / 10 = 9.5 -> 10
    })

    it('항목 수가 딱 맞아떨어지는 경우를 처리해야 함', () => {
      const info = createPaginationInfo(2, 20, 60)

      expect(info).toEqual({
        page: 2,
        limit: 20,
        total: 60,
        totalPages: 3,
      })
    })

    it('항목이 없는 경우를 처리해야 함', () => {
      const info = createPaginationInfo(1, 10, 0)

      expect(info).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      })
    })

    it('항목 수가 limit보다 작은 경우를 처리해야 함', () => {
      const info = createPaginationInfo(1, 10, 5)

      expect(info).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1,
      })
    })

    it('큰 페이지 번호도 처리해야 함', () => {
      const info = createPaginationInfo(50, 20, 1000)

      expect(info).toEqual({
        page: 50,
        limit: 20,
        total: 1000,
        totalPages: 50,
      })
    })

    it('limit이 1인 경우도 처리해야 함', () => {
      const info = createPaginationInfo(1, 1, 10)

      expect(info).toEqual({
        page: 1,
        limit: 1,
        total: 10,
        totalPages: 10,
      })
    })
  })
})
