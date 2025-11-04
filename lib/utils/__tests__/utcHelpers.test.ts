/**
 * UTC 헬퍼 함수 테스트
 * 특히 datetime-local 변환 함수의 시간대 처리를 검증
 */

import { fromDatetimeLocalString, toDatetimeLocalString } from '../utcHelpers'

describe('UTC Helpers - datetime-local 변환', () => {
  describe('toDatetimeLocalString', () => {
    it('UTC 시간을 로컬 시간으로 변환하여 datetime-local 형식 반환', () => {
      // Given: UTC 시간
      const utcDateString = '2025-10-20T05:30:00.000Z'

      // When: datetime-local 형식으로 변환
      const result = toDatetimeLocalString(utcDateString)

      // Then: 로컬 시간대로 변환되어야 함
      // 주의: 실제 결과는 테스트 실행 환경의 시간대에 따라 다름
      // 한국(UTC+9)에서 실행 시: '2025-10-20T14:30'
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)

      // 변환된 시간을 다시 Date로 만들어서 원본과 같은 시점을 가리키는지 확인
      const parsedDate = new Date(result + ':00')
      const originalDate = new Date(utcDateString)
      expect(parsedDate.getTime()).toBe(originalDate.getTime())
    })

    it('빈 값이나 null에 대해 빈 문자열 반환', () => {
      expect(toDatetimeLocalString(null)).toBe('')
      expect(toDatetimeLocalString(undefined)).toBe('')
      expect(toDatetimeLocalString('')).toBe('')
    })

    it('유효하지 않은 날짜에 대해 빈 문자열 반환', () => {
      expect(toDatetimeLocalString('invalid-date')).toBe('')
    })
  })

  describe('fromDatetimeLocalString', () => {
    it('로컬 datetime-local 값을 UTC ISO 문자열로 변환', () => {
      // Given: datetime-local 형식 입력 (로컬 시간)
      const localDatetimeString = '2025-10-20T14:30'

      // When: UTC ISO 문자열로 변환
      const result = fromDatetimeLocalString(localDatetimeString)

      // Then: ISO 8601 UTC 형식이어야 함
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

      // 변환된 UTC 시간을 로컬 Date로 파싱하면 원본 시간과 일치해야 함
      const parsedDate = new Date(result)
      expect(parsedDate.getFullYear()).toBe(2025)
      expect(parsedDate.getMonth()).toBe(9) // 0-indexed
      expect(parsedDate.getDate()).toBe(20)
      expect(parsedDate.getHours()).toBe(14)
      expect(parsedDate.getMinutes()).toBe(30)
    })

    it('빈 값에 대해 빈 문자열 반환', () => {
      expect(fromDatetimeLocalString('')).toBe('')
    })

    it('유효하지 않은 날짜에 대해 빈 문자열 반환', () => {
      expect(fromDatetimeLocalString('invalid')).toBe('')
      expect(fromDatetimeLocalString('2025-13-45T99:99')).toBe('')
    })
  })

  describe('왕복 변환 테스트 (Round-trip)', () => {
    it('UTC → 로컬 → UTC 변환이 원본을 보존해야 함', () => {
      // Given: 원본 UTC 시간
      const originalUTC = '2025-10-20T05:30:00.000Z'

      // When: UTC → datetime-local → UTC 변환
      const localString = toDatetimeLocalString(originalUTC)
      const backToUTC = fromDatetimeLocalString(localString)

      // Then: 원본과 동일한 시점을 가리켜야 함
      const originalTime = new Date(originalUTC).getTime()
      const resultTime = new Date(backToUTC).getTime()
      expect(resultTime).toBe(originalTime)
    })

    it('로컬 → UTC → 로컬 변환이 원본을 보존해야 함', () => {
      // Given: datetime-local 형식 입력
      const originalLocal = '2025-10-20T14:30'

      // When: datetime-local → UTC → datetime-local 변환
      const utcString = fromDatetimeLocalString(originalLocal)
      const backToLocal = toDatetimeLocalString(utcString)

      // Then: 원본과 동일해야 함
      expect(backToLocal).toBe(originalLocal)
    })
  })

  describe('실제 사용 시나리오', () => {
    it('사용자가 Round 시작일을 입력하고 서버로 전송하는 플로우', () => {
      // Given: 사용자가 datetime-local input에 입력한 값
      const userInput = '2025-12-25T09:00' // 크리스마스 아침 9시

      // When: 서버로 전송하기 위해 UTC로 변환
      const utcForServer = fromDatetimeLocalString(userInput)

      // Then: UTC ISO 형식이어야 함
      expect(utcForServer).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

      // And: 서버에서 받은 UTC 시간을 다시 표시할 때
      const displayValue = toDatetimeLocalString(utcForServer)

      // Then: 사용자가 입력한 원본 값과 동일해야 함
      expect(displayValue).toBe(userInput)
    })

    it('다른 시간대 사용자가 동일한 UTC 시간을 보는 시나리오', () => {
      // Given: 서버에 저장된 UTC 시간 (예: 회의 시작 시간)
      const serverUTC = '2025-11-15T01:00:00.000Z' // UTC 새벽 1시

      // When: 각 지역 사용자가 이 시간을 datetime-local로 변환
      const localDisplay = toDatetimeLocalString(serverUTC)

      // Then: 형식은 올바르고
      expect(localDisplay).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)

      // And: 다시 UTC로 변환하면 동일한 시점을 가리켜야 함
      const backToUTC = fromDatetimeLocalString(localDisplay)
      expect(new Date(backToUTC).getTime()).toBe(new Date(serverUTC).getTime())
    })
  })
})
