import {
  canDeleteCommunity,
  canJoinCommunity,
  prepareCommunityUpdate,
  prepareImageUpload,
} from '../community.core'

describe('Community Functional Core (Pure Domain Logic)', () => {
  describe('canJoinCommunity', () => {
    it('C-01: 신규 사용자는 가입 가능하다', () => {
      const result = canJoinCommunity({
        userId: 'user-1',
        isExistingMember: false,
      })

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({
          userId: 'user-1',
          role: 'member',
        })
      }
    })

    it('C-01-F: 이미 가입된 사용자는 가입 실패한다', () => {
      const result = canJoinCommunity({
        userId: 'user-1',
        isExistingMember: true,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('이미 가입된 커뮤니티입니다')
      }
    })

    it('C-01-F: userId가 없으면 인증 오류를 반환한다', () => {
      const result = canJoinCommunity({
        userId: null,
        isExistingMember: false,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('인증이 필요합니다')
      }
    })
  })

  describe('prepareCommunityUpdate', () => {
    it('C-02: 유효한 변경사항을 정제하여 반환한다', () => {
      const result = prepareCommunityUpdate({
        name: '  토끼 모임  ',
        description: '새 설명',
        region: '서울',
        subRegion: '강남구',
        tagname: ['러닝'],
      })

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({
          name: '토끼 모임',
          description: '새 설명',
          region: '서울',
          subRegion: '강남구',
          tagname: ['러닝'],
        })
      }
    })

    it('C-02-F: 이름이 공백인 경우 유효성 검증 오류를 반환한다', () => {
      const result = prepareCommunityUpdate({
        name: '   ',
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('커뮤니티 이름은 비어있을 수 없습니다')
      }
    })

    it('C-02-F: 변경할 필드가 하나도 없으면 오류를 반환한다', () => {
      const result = prepareCommunityUpdate({})

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('수정할 내용이 없습니다')
      }
    })
  })

  describe('canDeleteCommunity', () => {
    it('C-03: 관리자 권한이 있고 삭제되지 않은 커뮤니티는 삭제 가능하다', () => {
      const result = canDeleteCommunity({
        isAdmin: true,
        isDeleted: false,
      })

      expect(result.isOk()).toBe(true)
    })

    it('C-03-F: 관리자 권한이 없으면 삭제할 수 없다', () => {
      const result = canDeleteCommunity({
        isAdmin: false,
        isDeleted: false,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('커뮤니티를 삭제할 권한이 없습니다')
      }
    })

    it('C-03-F: 이미 삭제된 커뮤니티는 삭제할 수 없다', () => {
      const result = canDeleteCommunity({
        isAdmin: true,
        isDeleted: true,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('이미 삭제된 커뮤니티입니다')
      }
    })
  })

  describe('prepareImageUpload', () => {
    it('C-04: 유효한 이미지 메타데이터로 고유한 저장 경로를 생성한다', () => {
      const result = prepareImageUpload(
        {
          fileName: 'profile.PNG',
          fileSize: 1024 * 1024, // 1MB
        },
        {
          timestamp: 1700000000000,
          randomSuffix: 'abc123xyz',
        }
      )

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.filePath).toBe('community-images/1700000000000-abc123xyz.png')
        expect(result.value.fileName).toBe('1700000000000-abc123xyz.png')
      }
    })

    it('C-04-F: 지원하지 않는 확장자는 오류를 반환한다', () => {
      const result = prepareImageUpload(
        {
          fileName: 'dangerous.exe',
          fileSize: 1024,
        },
        {
          timestamp: 1700000000000,
          randomSuffix: 'abc123xyz',
        }
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('지원하지 않는 이미지 형식입니다')
      }
    })

    it('C-04-F: 파일 크기가 5MB를 초과하면 오류를 반환한다', () => {
      const result = prepareImageUpload(
        {
          fileName: 'large.jpg',
          fileSize: 6 * 1024 * 1024,
        },
        {
          timestamp: 1700000000000,
          randomSuffix: 'abc123xyz',
        }
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('이미지 파일 크기는 5MB를 초과할 수 없습니다')
      }
    })
  })
})
