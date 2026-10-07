import {
  isWithinRoundWindow,
  validateRoundCreation,
  validateRoundUpdate,
} from '@/lib/rounds/rounds.core'

describe('rounds.core', () => {
  describe('isWithinRoundWindow', () => {
    const startDate = new Date('2026-10-07T10:00:00Z')
    const endDate = new Date('2026-10-07T12:00:00Z')

    it('시작 시간 이전이면 false를 반환해야 합니다', () => {
      const before = new Date('2026-10-07T09:59:59Z')
      expect(isWithinRoundWindow(before, startDate, endDate)).toBe(false)
    })

    it('시작 정각이면 true를 반환해야 합니다', () => {
      expect(isWithinRoundWindow(startDate, startDate, endDate)).toBe(true)
    })

    it('종료 정각이면 true를 반환해야 합니다', () => {
      expect(isWithinRoundWindow(endDate, startDate, endDate)).toBe(true)
    })

    it('시작과 종료 사이 시간이면 true를 반환해야 합니다', () => {
      const middle = new Date('2026-10-07T11:00:00Z')
      expect(isWithinRoundWindow(middle, startDate, endDate)).toBe(true)
    })

    it('종료 시간 이후이면 false를 반환해야 합니다', () => {
      const after = new Date('2026-10-07T12:00:01Z')
      expect(isWithinRoundWindow(after, startDate, endDate)).toBe(false)
    })

    it('startDate 또는 endDate가 null이면 false를 반환해야 합니다', () => {
      const now = new Date('2026-10-07T11:00:00Z')
      expect(isWithinRoundWindow(now, null, endDate)).toBe(false)
      expect(isWithinRoundWindow(now, startDate, null)).toBe(false)
      expect(isWithinRoundWindow(now, null, null)).toBe(false)
    })
  })

  describe('validateRoundCreation', () => {
    it('유효한 입력값에 대해 성공 Result를 반환해야 합니다', () => {
      const result = validateRoundCreation({
        clubId: 'club-1',
        roundNumber: 1,
        startDate: '2026-10-07T10:00:00Z',
        endDate: '2026-10-07T12:00:00Z',
        location: '강남역',
      })

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.clubId).toBe('club-1')
        expect(result.value.roundNumber).toBe(1)
        expect(result.value.startDate).toEqual(new Date('2026-10-07T10:00:00Z'))
        expect(result.value.endDate).toEqual(new Date('2026-10-07T12:00:00Z'))
        expect(result.value.location).toBe('강남역')
      }
    })

    it('clubId가 비어있으면 에러를 반환해야 합니다', () => {
      const result = validateRoundCreation({
        clubId: '',
        roundNumber: 1,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('clubId')
      }
    })

    it('roundNumber가 1 미만이면 에러를 반환해야 합니다', () => {
      const result = validateRoundCreation({
        clubId: 'club-1',
        roundNumber: 0,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('roundNumber')
      }
    })

    it('종료 시간이 시작 시간보다 이전이면 에러를 반환해야 합니다', () => {
      const result = validateRoundCreation({
        clubId: 'club-1',
        roundNumber: 1,
        startDate: '2026-10-07T12:00:00Z',
        endDate: '2026-10-07T10:00:00Z',
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('종료 시간은 시작 시간 이후여야 합니다')
      }
    })
  })

  describe('validateRoundUpdate', () => {
    it('유효한 부분 업데이트에 대해 성공 Result를 반환해야 합니다', () => {
      const result = validateRoundUpdate({
        startDate: '2026-10-07T10:00:00Z',
        endDate: '2026-10-07T12:00:00Z',
        location: '역삼역',
      })

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.location).toBe('역삼역')
        expect(result.value.startDate).toEqual(new Date('2026-10-07T10:00:00Z'))
      }
    })

    it('업데이트 시 종료 시간이 시작 시간보다 이전이면 에러를 반환해야 합니다', () => {
      const result = validateRoundUpdate({
        startDate: '2026-10-07T15:00:00Z',
        endDate: '2026-10-07T14:00:00Z',
      })

      expect(result.isErr()).toBe(true)
    })

    it('기존 라운드가 주어졌을 때 startDate 단독 수정이 기존 endDate보다 늦으면 에러를 반환해야 합니다 (C-R03)', () => {
      const existing = {
        startDate: new Date('2026-10-07T10:00:00Z'),
        endDate: new Date('2026-10-07T12:00:00Z'),
      }

      const result = validateRoundUpdate(
        {
          startDate: '2026-10-07T13:00:00Z',
        },
        existing
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('종료 시간은 시작 시간 이후여야 합니다')
      }
    })

    it('기존 라운드가 주어졌을 때 endDate 단독 수정이 기존 startDate보다 앞서면 에러를 반환해야 합니다 (C-R04)', () => {
      const existing = {
        startDate: new Date('2026-10-07T10:00:00Z'),
        endDate: new Date('2026-10-07T12:00:00Z'),
      }

      const result = validateRoundUpdate(
        {
          endDate: '2026-10-07T09:00:00Z',
        },
        existing
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('종료 시간은 시작 시간 이후여야 합니다')
      }
    })

    it('기존 라운드와 비교하여 유효한 단독 수정은 성공해야 합니다', () => {
      const existing = {
        startDate: new Date('2026-10-07T10:00:00Z'),
        endDate: new Date('2026-10-07T12:00:00Z'),
      }

      const result = validateRoundUpdate(
        {
          startDate: '2026-10-07T11:00:00Z',
        },
        existing
      )

      expect(result.isOk()).toBe(true)
    })
  })
})
