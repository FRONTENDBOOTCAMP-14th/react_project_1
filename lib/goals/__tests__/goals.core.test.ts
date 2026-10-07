import { canManageGoal, validateGoalCreation, validateGoalUpdate } from '@/lib/goals/goals.core'

describe('goals.core', () => {
  describe('validateGoalCreation', () => {
    it('유효한 목표 생성 데이터에 대해 성공 Result를 반환해야 합니다 (C-G01)', () => {
      const result = validateGoalCreation(
        {
          title: '알고리즘 3문제 풀기',
          description: '백준 골드 문제 풀기',
          startDate: '2026-10-07T10:00:00Z',
          endDate: '2026-10-07T12:00:00Z',
          isTeam: false,
        },
        'user-1'
      )

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.ownerId).toBe('user-1')
        expect(result.value.title).toBe('알고리즘 3문제 풀기')
        expect(result.value.description).toBe('백준 골드 문제 풀기')
        expect(result.value.startDate).toEqual(new Date('2026-10-07T10:00:00Z'))
        expect(result.value.endDate).toEqual(new Date('2026-10-07T12:00:00Z'))
        expect(result.value.isTeam).toBe(false)
        expect(result.value.isComplete).toBe(false)
      }
    })

    it('팀 목표인데 clubId가 없으면 에러를 반환해야 합니다 (C-G02, INV-G03)', () => {
      const result = validateGoalCreation(
        {
          title: '팀 스터디 과제',
          isTeam: true,
          clubId: null,
          startDate: '2026-10-07T10:00:00Z',
          endDate: '2026-10-07T12:00:00Z',
        },
        'user-1'
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('팀 목표는 커뮤니티(clubId) 지정이 필수입니다')
      }
    })

    it('시작일이 종료일보다 늦으면 에러를 반환해야 합니다 (C-G03, INV-G01)', () => {
      const result = validateGoalCreation(
        {
          title: '일정 역전 목표',
          startDate: '2026-10-07T15:00:00Z',
          endDate: '2026-10-07T10:00:00Z',
        },
        'user-1'
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('종료 시간은 시작 시간 이후여야 합니다')
      }
    })

    it('제목이 비어있으면 에러를 반환해야 합니다 (INV-G05)', () => {
      const result = validateGoalCreation(
        {
          title: '   ',
          startDate: '2026-10-07T10:00:00Z',
          endDate: '2026-10-07T12:00:00Z',
        },
        'user-1'
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('제목은 1자 이상')
      }
    })

    it('제목이 100자를 초과하면 에러를 반환해야 합니다 (INV-G05)', () => {
      const result = validateGoalCreation(
        {
          title: 'a'.repeat(101),
          startDate: '2026-10-07T10:00:00Z',
          endDate: '2026-10-07T12:00:00Z',
        },
        'user-1'
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('100자 이하')
      }
    })

    it('유효하지 않은 날짜 형식이면 에러를 반환해야 합니다 (INV-G01)', () => {
      const result = validateGoalCreation(
        {
          title: '잘못된 날짜',
          startDate: 'invalid-date',
          endDate: '2026-10-07T12:00:00Z',
        },
        'user-1'
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('유효하지 않은 시작 날짜 형식입니다')
      }
    })
  })

  describe('validateGoalUpdate', () => {
    it('유효한 부분 수정에 대해 성공 Result를 반환해야 합니다', () => {
      const result = validateGoalUpdate({
        title: '수정된 제목',
        isComplete: true,
      })

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.title).toBe('수정된 제목')
        expect(result.value.isComplete).toBe(true)
      }
    })

    it('수정할 내용이 전혀 없으면 에러를 반환해야 합니다 (C-02, INV-02)', () => {
      const result = validateGoalUpdate({})
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('수정할 내용이 없습니다')
      }
    })

    it('수정 시 시작일이 종료일보다 늦으면 에러를 반환해야 합니다 (INV-G01)', () => {
      const result = validateGoalUpdate({
        startDate: '2026-10-07T16:00:00Z',
        endDate: '2026-10-07T12:00:00Z',
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('종료 시간은 시작 시간 이후여야 합니다')
      }
    })

    it('기존 목표 일정이 주어졌을 때 startDate 단독 수정이 기존 endDate보다 늦으면 에러를 반환해야 합니다 (C-G04, INV-G02)', () => {
      const existing = {
        startDate: new Date('2026-10-07T10:00:00Z'),
        endDate: new Date('2026-10-07T12:00:00Z'),
      }

      const result = validateGoalUpdate(
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

    it('기존 목표 일정이 주어졌을 때 endDate 단독 수정이 기존 startDate보다 앞서면 에러를 반환해야 합니다 (INV-G02)', () => {
      const existing = {
        startDate: new Date('2026-10-07T10:00:00Z'),
        endDate: new Date('2026-10-07T12:00:00Z'),
      }

      const result = validateGoalUpdate(
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
  })

  describe('canManageGoal', () => {
    it('소유자 일치 시 true를 반환해야 합니다 (C-G05, INV-G04)', () => {
      expect(canManageGoal('user-1', 'user-1')).toBe(true)
    })

    it('소유자 불일치 시 false를 반환해야 합니다 (C-G06, INV-G04)', () => {
      expect(canManageGoal('user-1', 'user-2')).toBe(false)
    })
  })
})
