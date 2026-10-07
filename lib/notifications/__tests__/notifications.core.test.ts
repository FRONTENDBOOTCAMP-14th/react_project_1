import {
  canManageNotification,
  validateNotificationCreation,
  validateNotificationUpdate,
} from '@/lib/notifications/notifications.core'

describe('notifications.core', () => {
  describe('validateNotificationCreation', () => {
    it('유효한 공지사항 생성 데이터를 정제하여 반환해야 함 (C-N01, INV-N01)', () => {
      const result = validateNotificationCreation(
        {
          clubId: 'club-1',
          title: '  정기 모임 공지  ',
          content: '  이번 주 토요일 14시  ',
          isPinned: true,
        },
        'user-admin'
      )

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.clubId).toBe('club-1')
        expect(result.value.authorId).toBe('user-admin')
        expect(result.value.title).toBe('정기 모임 공지')
        expect(result.value.content).toBe('이번 주 토요일 14시')
        expect(result.value.isPinned).toBe(true)
      }
    })

    it('clubId가 없으면 에러를 반환해야 함', () => {
      const result = validateNotificationCreation(
        {
          clubId: '',
          title: '공지',
        },
        'user-admin'
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('clubId')
      }
    })

    it('공백 제목은 거부해야 함 (INV-N01)', () => {
      const result = validateNotificationCreation(
        {
          clubId: 'club-1',
          title: '   ',
        },
        'user-admin'
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('제목')
      }
    })

    it('제목이 200자를 초과하면 거부해야 함 (INV-N01)', () => {
      const result = validateNotificationCreation(
        {
          clubId: 'club-1',
          title: 'a'.repeat(201),
        },
        'user-admin'
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('200자 이하')
      }
    })
  })

  describe('validateNotificationUpdate', () => {
    it('유효한 부분 업데이트 데이터를 정제하여 반환해야 함', () => {
      const result = validateNotificationUpdate({
        title: '수정된 공지',
        content: '수정된 내용',
        isPinned: false,
      })

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.title).toBe('수정된 공지')
        expect(result.value.content).toBe('수정된 내용')
        expect(result.value.isPinned).toBe(false)
      }
    })

    it('수정할 내용이 전혀 없으면 에러를 반환해야 합니다 (C-03, INV-02)', () => {
      const result = validateNotificationUpdate({})
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('수정할 내용이 없습니다')
      }
    })

    it('공백 제목으로 수정 시도는 거부해야 함 (INV-N01)', () => {
      const result = validateNotificationUpdate({
        title: '   ',
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('제목')
      }
    })
  })

  describe('canManageNotification (C-N02, C-N03, INV-N03)', () => {
    it('작성자 본인이면 true를 반환해야 함', () => {
      expect(canManageNotification('author-1', 'author-1', 'member')).toBe(true)
    })

    it('관리자(admin)이면 작성자가 아니어도 true를 반환해야 함', () => {
      expect(canManageNotification('author-1', 'other-user', 'admin')).toBe(true)
    })

    it('작성자가 아니고 관리자도 아니면 false를 반환해야 함', () => {
      expect(canManageNotification('author-1', 'other-user', 'member')).toBe(false)
      expect(canManageNotification('author-1', 'other-user', null)).toBe(false)
    })
  })
})
