/**
 * pathHelpers.ts 유틸리티 테스트
 */

import { decodeAndCapitalize, isUUID, isNumericId } from '../pathHelpers'

describe('pathHelpers utilities', () => {
  describe('decodeAndCapitalize', () => {
    it('하이픈을 공백으로 변환해야 함', () => {
      expect(decodeAndCapitalize('my-project')).toBe('My project')
      expect(decodeAndCapitalize('hello-world')).toBe('Hello world')
    })

    it('URL 인코딩된 문자열을 디코딩해야 함', () => {
      expect(decodeAndCapitalize('hello%20world')).toBe('Hello world')
      expect(decodeAndCapitalize('%ED%95%9C%EA%B8%80')).toBe('한글')
    })

    it('첫 글자를 대문자로 변환해야 함', () => {
      expect(decodeAndCapitalize('test')).toBe('Test')
      expect(decodeAndCapitalize('example-text')).toBe('Example text')
    })

    it('이미 대문자인 경우 그대로 유지해야 함', () => {
      expect(decodeAndCapitalize('Test')).toBe('Test')
      expect(decodeAndCapitalize('HELLO')).toBe('HELLO')
    })

    it('영문 알파벳이 아닌 경우 변환하지 않아야 함', () => {
      expect(decodeAndCapitalize('123')).toBe('123')
      expect(decodeAndCapitalize('한글')).toBe('한글')
    })

    it('디코딩 실패 시 원본 문자열을 반환해야 함', () => {
      const invalidEncoded = '%E0%A4%A'
      expect(decodeAndCapitalize(invalidEncoded)).toBe(invalidEncoded)
    })

    it('빈 문자열을 처리해야 함', () => {
      expect(decodeAndCapitalize('')).toBe('')
    })

    it('복합 케이스를 처리해야 함', () => {
      expect(decodeAndCapitalize('my-awesome-project')).toBe('My awesome project')
      expect(decodeAndCapitalize('test%20string-with-hyphens')).toBe(
        'Test string with hyphens'
      )
    })
  })

  describe('isUUID', () => {
    it('유효한 UUID는 true를 반환해야 함', () => {
      expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
      expect(isUUID('00000000-0000-0000-0000-000000000000')).toBe(true)
    })

    it('대소문자를 구분하지 않아야 함', () => {
      expect(isUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
      expect(isUUID('550e8400-E29B-41d4-A716-446655440000')).toBe(true)
    })

    it('유효하지 않은 UUID는 false를 반환해야 함', () => {
      expect(isUUID('not-a-uuid')).toBe(false)
      expect(isUUID('550e8400-e29b-41d4-a716')).toBe(false) // 너무 짧음
      expect(isUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false) // 너무 김
      expect(isUUID('550e8400e29b41d4a716446655440000')).toBe(false) // 하이픈 없음
    })

    it('하이픈 위치가 잘못된 경우 false를 반환해야 함', () => {
      expect(isUUID('550e8400-e29b41d4-a716-446655440000')).toBe(false)
      expect(isUUID('550e8400e-29b-41d4-a716-446655440000')).toBe(false)
    })

    it('빈 문자열은 false를 반환해야 함', () => {
      expect(isUUID('')).toBe(false)
    })

    it('UUID가 아닌 숫자 ID는 false를 반환해야 함', () => {
      expect(isUUID('12345')).toBe(false)
      expect(isUUID('123456789')).toBe(false)
    })
  })

  describe('isNumericId', () => {
    it('숫자 문자열은 true를 반환해야 함', () => {
      expect(isNumericId('123')).toBe(true)
      expect(isNumericId('456789')).toBe(true)
      expect(isNumericId('1')).toBe(true)
    })

    it('앞에 0이 있어도 true를 반환해야 함', () => {
      expect(isNumericId('0123')).toBe(true)
      expect(isNumericId('00001')).toBe(true)
    })

    it('영문자가 포함되면 false를 반환해야 함', () => {
      expect(isNumericId('abc123')).toBe(false)
      expect(isNumericId('123abc')).toBe(false)
      expect(isNumericId('12a34')).toBe(false)
    })

    it('특수문자가 포함되면 false를 반환해야 함', () => {
      expect(isNumericId('123-456')).toBe(false)
      expect(isNumericId('123.456')).toBe(false)
      expect(isNumericId('123 456')).toBe(false)
    })

    it('UUID는 false를 반환해야 함', () => {
      expect(isNumericId('550e8400-e29b-41d4-a716-446655440000')).toBe(false)
    })

    it('빈 문자열은 false를 반환해야 함', () => {
      expect(isNumericId('')).toBe(false)
    })

    it('음수 부호가 있으면 false를 반환해야 함', () => {
      expect(isNumericId('-123')).toBe(false)
    })

    it('양수 부호가 있으면 false를 반환해야 함', () => {
      expect(isNumericId('+123')).toBe(false)
    })
  })
})
