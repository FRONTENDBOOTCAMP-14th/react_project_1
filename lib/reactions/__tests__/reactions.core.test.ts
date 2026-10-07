import {
  canManageReaction,
  validateReactionCreation,
  validateReactionUpdate,
} from '@/lib/reactions/reactions.core'

describe('reactions.core', () => {
  describe('validateReactionCreation (C-R01, C-R02, INV-RC01)', () => {
    it('유효한 리액션 생성 데이터를 정제하여 반환해야 함', () => {
      const result = validateReactionCreation(
        {
          memberId: 'member-1',
          reaction: '  👍 최고에요!  ',
        },
        'user-1'
      )

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.memberId).toBe('member-1')
        expect(result.value.userId).toBe('user-1')
        expect(result.value.reaction).toBe('👍 최고에요!')
      }
    })

    it('memberId가 없으면 에러를 반환해야 함', () => {
      const result = validateReactionCreation(
        {
          memberId: '',
          reaction: '👍',
        },
        'user-1'
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('memberId')
      }
    })

    it('공백 리액션 내용은 거부해야 함 (INV-RC01)', () => {
      const result = validateReactionCreation(
        {
          memberId: 'member-1',
          reaction: '   ',
        },
        'user-1'
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('리액션 내용')
      }
    })

    it('리액션이 50자를 초과하면 거부해야 함 (INV-RC01)', () => {
      const result = validateReactionCreation(
        {
          memberId: 'member-1',
          reaction: 'a'.repeat(51),
        },
        'user-1'
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('50자 이하')
      }
    })
  })

  describe('validateReactionUpdate', () => {
    it('유효한 리액션 수정 데이터를 정제하여 반환해야 함', () => {
      const result = validateReactionUpdate({
        reaction: '  ❤️  ',
      })

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.reaction).toBe('❤️')
      }
    })

    it('공백 리액션으로 수정 시도는 거부해야 함 (INV-RC01)', () => {
      const result = validateReactionUpdate({
        reaction: '   ',
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('리액션 내용')
      }
    })
  })

  describe('canManageReaction (C-R03, INV-RC02)', () => {
    it('본인 리액션이면 true를 반환해야 함', () => {
      expect(canManageReaction('user-1', 'user-1')).toBe(true)
    })

    it('타인 리액션이면 false를 반환해야 함', () => {
      expect(canManageReaction('user-1', 'user-2')).toBe(false)
    })
  })
})
