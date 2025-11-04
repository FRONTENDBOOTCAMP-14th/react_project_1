/**
 * validation.ts 유틸리티 테스트
 */

import {
  isFutureDate,
  isFutureDateUTC,
  isISODateString,
  isValidDateRange,
  isValidDateRangeUTC,
  isValidEmail,
  isValidGoalDescription,
  isValidGoalTitle,
  isValidLength,
  isValidNickname,
  isValidPassword,
  isValidUrl,
  isValidUsername,
} from '../validation'

describe('validation utilities', () => {
  describe('isValidEmail', () => {
    it('유효한 이메일은 true를 반환해야 함', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.kr')).toBe(true)
      expect(isValidEmail('test+tag@gmail.com')).toBe(true)
    })

    it('유효하지 않은 이메일은 false를 반환해야 함', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('test @domain.com')).toBe(false)
      expect(isValidEmail('test@domain')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidNickname', () => {
    it('유효한 닉네임은 true를 반환해야 함', () => {
      expect(isValidNickname('홍길동')).toBe(true)
      expect(isValidNickname('user123')).toBe(true)
      expect(isValidNickname('User_Name')).toBe(true)
      expect(isValidNickname('한글 닉네임')).toBe(true)
      expect(isValidNickname('가나다라마바사아자차카타파하')).toBe(true) // 15자
    })

    it('너무 짧은 닉네임은 false를 반환해야 함', () => {
      expect(isValidNickname('a')).toBe(false)
      expect(isValidNickname('가')).toBe(false)
    })

    it('너무 긴 닉네임은 false를 반환해야 함', () => {
      expect(isValidNickname('a'.repeat(21))).toBe(false)
      expect(isValidNickname('가나다라마바사아자차카타파하호')).toBe(true) // 16자는 유효
      expect(isValidNickname('가나다라마바사아자차카타파하호가나다라마바사')).toBe(false) // 21자는 무효
    })

    it('허용되지 않은 문자가 포함된 닉네임은 false를 반환해야 함', () => {
      expect(isValidNickname('test@user')).toBe(false)
      expect(isValidNickname('test!user')).toBe(false)
      expect(isValidNickname('test#user')).toBe(false)
    })

    it('빈 문자열은 false를 반환해야 함', () => {
      expect(isValidNickname('')).toBe(false)
    })
  })

  describe('isValidLength', () => {
    it('범위 내 문자열은 true를 반환해야 함', () => {
      expect(isValidLength('test', { min: 1, max: 10 })).toBe(true)
      expect(isValidLength('hello world', { min: 5, max: 20 })).toBe(true)
    })

    it('최소 길이보다 짧으면 false를 반환해야 함', () => {
      expect(isValidLength('a', { min: 2, max: 10 })).toBe(false)
      expect(isValidLength('', { min: 1 })).toBe(false)
    })

    it('최대 길이보다 길면 false를 반환해야 함', () => {
      expect(isValidLength('hello world', { min: 1, max: 5 })).toBe(false)
    })

    it('옵션 없이 호출하면 항상 true를 반환해야 함', () => {
      expect(isValidLength('any text')).toBe(true)
      expect(isValidLength('')).toBe(true)
    })

    it('최소값만 지정 가능해야 함', () => {
      expect(isValidLength('test', { min: 2 })).toBe(true)
      expect(isValidLength('a', { min: 2 })).toBe(false)
    })

    it('최대값만 지정 가능해야 함', () => {
      expect(isValidLength('test', { max: 10 })).toBe(true)
      expect(isValidLength('very long text here', { max: 10 })).toBe(false)
    })
  })

  describe('isValidGoalTitle', () => {
    it('유효한 목표 제목은 true를 반환해야 함', () => {
      expect(isValidGoalTitle('알고리즘 공부하기')).toBe(true)
      expect(isValidGoalTitle('a')).toBe(true)
      expect(isValidGoalTitle('a'.repeat(100))).toBe(true)
    })

    it('빈 문자열은 false를 반환해야 함', () => {
      expect(isValidGoalTitle('')).toBe(false)
    })

    it('100자를 초과하면 false를 반환해야 함', () => {
      expect(isValidGoalTitle('a'.repeat(101))).toBe(false)
    })
  })

  describe('isValidGoalDescription', () => {
    it('유효한 목표 설명은 true를 반환해야 함', () => {
      expect(isValidGoalDescription('자세한 설명입니다')).toBe(true)
      expect(isValidGoalDescription('a'.repeat(1000))).toBe(true)
    })

    it('빈 문자열도 허용해야 함', () => {
      expect(isValidGoalDescription('')).toBe(true)
    })

    it('1000자를 초과하면 false를 반환해야 함', () => {
      expect(isValidGoalDescription('a'.repeat(1001))).toBe(false)
    })
  })

  describe('isValidDateRange', () => {
    it('시작일이 종료일보다 앞서면 true를 반환해야 함', () => {
      const start = new Date('2024-01-01')
      const end = new Date('2024-01-31')
      expect(isValidDateRange(start, end)).toBe(true)
    })

    it('시작일과 종료일이 같으면 true를 반환해야 함', () => {
      const date = new Date('2024-01-01')
      expect(isValidDateRange(date, date)).toBe(true)
    })

    it('시작일이 종료일보다 뒤면 false를 반환해야 함', () => {
      const start = new Date('2024-01-31')
      const end = new Date('2024-01-01')
      expect(isValidDateRange(start, end)).toBe(false)
    })

    it('잘못된 날짜면 false를 반환해야 함', () => {
      expect(isValidDateRange('invalid', '2024-01-01')).toBe(false)
      expect(isValidDateRange('2024-01-01', 'invalid')).toBe(false)
    })

    it('문자열 날짜도 처리해야 함', () => {
      expect(isValidDateRange('2024-01-01', '2024-01-31')).toBe(true)
      expect(isValidDateRange('2024-01-31', '2024-01-01')).toBe(false)
    })
  })

  describe('isFutureDate', () => {
    const MOCK_NOW = new Date('2024-01-15T12:00:00Z')

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(MOCK_NOW)
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('미래 날짜는 true를 반환해야 함', () => {
      const future = new Date('2024-12-31')
      expect(isFutureDate(future)).toBe(true)
    })

    it('과거 날짜는 false를 반환해야 함', () => {
      const past = new Date('2023-01-01')
      expect(isFutureDate(past)).toBe(false)
    })

    it('현재 시각은 false를 반환해야 함', () => {
      expect(isFutureDate(MOCK_NOW)).toBe(false)
    })

    it('문자열 날짜도 처리해야 함', () => {
      expect(isFutureDate('2025-01-01')).toBe(true)
      expect(isFutureDate('2023-01-01')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('유효한 URL은 true를 반환해야 함', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true)
      expect(isValidUrl('https://sub.example.com')).toBe(true)
    })

    it('유효하지 않은 URL은 false를 반환해야 함', () => {
      expect(isValidUrl('not a url')).toBe(false)
      expect(isValidUrl('example.com')).toBe(false)
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl('ftp://example')).toBe(true) // ftp도 유효한 URL
    })
  })

  describe('isValidPassword', () => {
    it('유효한 비밀번호는 true를 반환해야 함', () => {
      expect(isValidPassword('Password1!')).toBe(true)
      expect(isValidPassword('StrongP@ssw0rd')).toBe(true)
      expect(isValidPassword('Abcd1234!')).toBe(true)
    })

    it('대문자가 없으면 false를 반환해야 함', () => {
      expect(isValidPassword('password1!')).toBe(false)
    })

    it('소문자가 없으면 false를 반환해야 함', () => {
      expect(isValidPassword('PASSWORD1!')).toBe(false)
    })

    it('숫자가 없으면 false를 반환해야 함', () => {
      expect(isValidPassword('Password!')).toBe(false)
    })

    it('특수문자가 없으면 false를 반환해야 함', () => {
      expect(isValidPassword('Password1')).toBe(false)
    })

    it('8자 미만이면 false를 반환해야 함', () => {
      expect(isValidPassword('Pass1!')).toBe(false)
    })

    it('50자를 초과하면 false를 반환해야 함', () => {
      expect(isValidPassword('P@ssword1' + 'a'.repeat(50))).toBe(false)
    })
  })

  describe('isValidUsername', () => {
    it('유효한 사용자명은 true를 반환해야 함', () => {
      expect(isValidUsername('user123')).toBe(true)
      expect(isValidUsername('test_user')).toBe(true)
      expect(isValidUsername('User_Name_123')).toBe(true)
    })

    it('3자 미만이면 false를 반환해야 함', () => {
      expect(isValidUsername('ab')).toBe(false)
    })

    it('30자를 초과하면 false를 반환해야 함', () => {
      expect(isValidUsername('a'.repeat(31))).toBe(false)
    })

    it('허용되지 않은 문자가 포함되면 false를 반환해야 함', () => {
      expect(isValidUsername('user-name')).toBe(false)
      expect(isValidUsername('user@name')).toBe(false)
      expect(isValidUsername('user name')).toBe(false)
      expect(isValidUsername('한글이름')).toBe(false)
    })

    it('빈 문자열은 false를 반환해야 함', () => {
      expect(isValidUsername('')).toBe(false)
    })
  })

  describe('isValidDateRangeUTC', () => {
    it('UTC 기준으로 시작일이 종료일보다 앞서면 true를 반환해야 함', () => {
      const start = new Date('2024-01-01T00:00:00Z')
      const end = new Date('2024-01-31T23:59:59Z')
      expect(isValidDateRangeUTC(start, end)).toBe(true)
    })

    it('UTC 기준으로 시작일과 종료일이 같으면 true를 반환해야 함', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      expect(isValidDateRangeUTC(date, date)).toBe(true)
    })

    it('UTC 기준으로 시작일이 종료일보다 뒤면 false를 반환해야 함', () => {
      const start = new Date('2024-01-31T00:00:00Z')
      const end = new Date('2024-01-01T00:00:00Z')
      expect(isValidDateRangeUTC(start, end)).toBe(false)
    })

    it('잘못된 날짜면 false를 반환해야 함', () => {
      expect(isValidDateRangeUTC('invalid', '2024-01-01T00:00:00Z')).toBe(false)
    })
  })

  describe('isFutureDateUTC', () => {
    const MOCK_NOW = new Date('2024-01-15T12:00:00Z')

    it('미래 날짜는 true를 반환해야 함', () => {
      const future = new Date('2024-12-31T00:00:00Z')
      expect(isFutureDateUTC(future, MOCK_NOW)).toBe(true)
    })

    it('과거 날짜는 false를 반환해야 함', () => {
      const past = new Date('2023-01-01T00:00:00Z')
      expect(isFutureDateUTC(past, MOCK_NOW)).toBe(false)
    })

    it('서버 시간을 제공하지 않으면 클라이언트 시간을 사용해야 함', () => {
      jest.useFakeTimers()
      jest.setSystemTime(MOCK_NOW)

      const future = new Date('2025-01-01T00:00:00Z')
      expect(isFutureDateUTC(future)).toBe(true)

      jest.useRealTimers()
    })

    it('잘못된 날짜는 false를 반환해야 함', () => {
      expect(isFutureDateUTC('invalid', MOCK_NOW)).toBe(false)
    })
  })

  describe('isISODateString', () => {
    it('유효한 ISO 8601 형식은 true를 반환해야 함', () => {
      expect(isISODateString('2024-01-15T12:00:00Z')).toBe(true)
      expect(isISODateString('2024-01-15T12:00:00.000Z')).toBe(true)
      expect(isISODateString('2024-01-15T12:00:00')).toBe(true)
    })

    it('유효하지 않은 형식은 false를 반환해야 함', () => {
      expect(isISODateString('2024-01-15')).toBe(false)
      expect(isISODateString('15/01/2024')).toBe(false)
      expect(isISODateString('not a date')).toBe(false)
      expect(isISODateString('')).toBe(false)
    })

    it('형식은 맞지만 유효하지 않은 날짜는 false를 반환해야 함', () => {
      expect(isISODateString('2024-13-01T12:00:00Z')).toBe(false) // 13월
      expect(isISODateString('2024-01-32T12:00:00Z')).toBe(false) // 32일
    })
  })
})
