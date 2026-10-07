import {
  buildAttendanceCreateData,
  buildAttendanceUpdateData,
  buildAttendanceWhereClause,
  createAttendanceRecord,
  findAttendanceByRoundAndUser,
} from '@/lib/attendance/attendance.server'
import prisma from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    attendance: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}))

describe('attendance.server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('buildAttendanceWhereClause', () => {
    it('기본 where 절을 생성해야 함', () => {
      const where = buildAttendanceWhereClause()
      expect(where).toEqual({ deletedAt: null })
    })

    it('필터 옵션을 올바르게 조합해야 함', () => {
      const where = buildAttendanceWhereClause({
        userId: 'u-1',
        roundId: 'r-1',
        attendanceType: 'present',
        clubId: 'c-1',
      })

      expect(where.userId).toBe('u-1')
      expect(where.roundId).toBe('r-1')
      expect(where.attendanceType).toBe('present')
      expect(where.round).toEqual({ clubId: 'c-1', deletedAt: null })
    })
  })

  describe('buildAttendanceCreateData', () => {
    it('필수 데이터로 Prisma 생성 입력 객체를 반환해야 함', () => {
      const date = new Date('2026-10-07T10:00:00Z')
      const data = buildAttendanceCreateData({
        userId: 'u-1',
        roundId: 'r-1',
        attendanceType: 'present',
        attendanceDate: date,
      })

      expect(data).toEqual({
        user: { connect: { userId: 'u-1' } },
        round: { connect: { roundId: 'r-1' } },
        attendanceType: 'present',
        attendanceDate: date,
      })
    })
  })

  describe('buildAttendanceUpdateData', () => {
    it('업데이트할 필드만 구성해야 함', () => {
      const data = buildAttendanceUpdateData({
        attendanceType: 'late',
      })
      expect(data).toEqual({ attendanceType: 'late' })
    })
  })

  describe('findAttendanceByRoundAndUser & createAttendanceRecord', () => {
    it('findAttendanceByRoundAndUser: deletedAt: null 조건으로 조회해야 함', async () => {
      ;(prisma.attendance.findFirst as jest.Mock).mockResolvedValue({ attendanceId: 10 })
      const res = await findAttendanceByRoundAndUser('r-1', 'u-1')
      expect(res).toEqual({ attendanceId: 10 })
      expect(prisma.attendance.findFirst).toHaveBeenCalledWith({
        where: { roundId: 'r-1', userId: 'u-1', deletedAt: null },
      })
    })

    it('createAttendanceRecord: prisma create를 호출해야 함', async () => {
      ;(prisma.attendance.create as jest.Mock).mockResolvedValue({ attendanceId: 10 })
      const res = await createAttendanceRecord({
        user: { connect: { userId: 'u-1' } },
        round: { connect: { roundId: 'r-1' } },
        attendanceType: 'present',
        attendanceDate: new Date('2026-10-07T10:00:00Z'),
      })
      expect(res).toEqual({ attendanceId: 10 })
      expect(prisma.attendance.create).toHaveBeenCalled()
    })
  })
})
