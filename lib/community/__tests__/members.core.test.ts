import { canDeleteMember, validateMemberCreation, validateMemberRoleUpdate } from '../members.core'

describe('Members Functional Core (Pure Domain Logic)', () => {
  describe('validateMemberCreation', () => {
    it('유효한 요청에 대해 멤버 생성 데이터를 반환한다', () => {
      const result = validateMemberCreation({
        clubId: 'club-1',
        userId: 'user-1',
        role: 'member',
        clubExists: true,
        isExistingMember: false,
      })

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({
          clubId: 'club-1',
          userId: 'user-1',
          role: 'member',
        })
      }
    })

    it('역할이 지정되지 않은 경우 기본값 member로 설정된다', () => {
      const result = validateMemberCreation({
        clubId: 'club-1',
        userId: 'user-1',
        clubExists: true,
        isExistingMember: false,
      })

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.role).toBe('member')
      }
    })

    it('유효하지 않은 역할이면 에러를 반환한다', () => {
      const result = validateMemberCreation({
        clubId: 'club-1',
        userId: 'user-1',
        role: 'owner' as unknown as 'member',
        clubExists: true,
        isExistingMember: false,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('유효하지 않은 역할입니다')
      }
    })

    it('커뮤니티가 존재하지 않으면 에러를 반환한다', () => {
      const result = validateMemberCreation({
        clubId: 'club-999',
        userId: 'user-1',
        clubExists: false,
        isExistingMember: false,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('커뮤니티를 찾을 수 없습니다')
      }
    })

    it('이미 가입된 멤버인 경우 에러를 반환한다', () => {
      const result = validateMemberCreation({
        clubId: 'club-1',
        userId: 'user-1',
        clubExists: true,
        isExistingMember: true,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('이미 가입된 커뮤니티입니다')
      }
    })
  })

  describe('validateMemberRoleUpdate', () => {
    it('팀장이 유효한 역할로 변경 요청 시 수정 데이터를 반환한다', () => {
      const result = validateMemberRoleUpdate({
        hasAdminPermission: true,
        memberExists: true,
        targetRole: 'admin',
      })

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({ role: 'admin' })
      }
    })

    it('멤버가 존재하지 않으면 에러를 반환한다', () => {
      const result = validateMemberRoleUpdate({
        hasAdminPermission: true,
        memberExists: false,
        targetRole: 'admin',
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('멤버를 찾을 수 없습니다')
      }
    })

    it('팀장 권한이 없으면 에러를 반환한다', () => {
      const result = validateMemberRoleUpdate({
        hasAdminPermission: false,
        memberExists: true,
        targetRole: 'admin',
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('팀장만 멤버 역할을 수정할 수 있습니다')
      }
    })

    it('유효하지 않은 역할로 수정 시 에러를 반환한다', () => {
      const result = validateMemberRoleUpdate({
        hasAdminPermission: true,
        memberExists: true,
        targetRole: 'guest' as unknown as 'member',
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('유효하지 않은 역할입니다')
      }
    })

    it('targetRole이 제공되지 않은 경우 에러를 반환한다', () => {
      const result = validateMemberRoleUpdate({
        hasAdminPermission: true,
        memberExists: true,
        targetRole: undefined,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('유효하지 않은 역할입니다')
      }
    })
  })

  describe('canDeleteMember', () => {
    it('본인인 경우 탈퇴 가능하다', () => {
      const result = canDeleteMember({
        memberExists: true,
        isSelf: true,
        hasAdminPermission: false,
      })

      expect(result.isOk()).toBe(true)
    })

    it('팀장인 경우 멤버를 강퇴/삭제 가능하다', () => {
      const result = canDeleteMember({
        memberExists: true,
        isSelf: false,
        hasAdminPermission: true,
      })

      expect(result.isOk()).toBe(true)
    })

    it('멤버가 존재하지 않으면 에러를 반환한다', () => {
      const result = canDeleteMember({
        memberExists: false,
        isSelf: true,
        hasAdminPermission: false,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('멤버를 찾을 수 없습니다')
      }
    })

    it('본인도 아니고 팀장도 아니면 에러를 반환한다', () => {
      const result = canDeleteMember({
        memberExists: true,
        isSelf: false,
        hasAdminPermission: false,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('본인 또는 팀장만 멤버를 삭제할 수 있습니다')
      }
    })

    it('유일한 관리자인 경우 탈퇴 또는 삭제가 불가능해야 한다', () => {
      const result = canDeleteMember({
        memberExists: true,
        isSelf: true,
        hasAdminPermission: true,
        isSoleAdmin: true,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('유일한 관리자는 탈퇴하거나 삭제될 수 없습니다')
      }
    })
  })
})
