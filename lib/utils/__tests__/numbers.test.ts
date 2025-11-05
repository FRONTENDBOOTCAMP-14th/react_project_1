/**
 * numbers.ts 유틸리티 테스트
 */

import {
  calculateAverage,
  calculateMax,
  calculateMin,
  calculatePercentage,
  calculateProgress,
  clamp,
  clampPercentage,
  roundToDecimal,
} from '../numbers'

describe('numbers utilities', () => {
  describe('calculatePercentage', () => {
    it('정확한 백분율을 계산해야 함', () => {
      expect(calculatePercentage(50, 100)).toBe(50)
      expect(calculatePercentage(25, 100)).toBe(25)
      expect(calculatePercentage(75, 100)).toBe(75)
    })

    it('소수점을 반올림해야 함', () => {
      expect(calculatePercentage(1, 3)).toBe(33)
      expect(calculatePercentage(2, 3)).toBe(67)
    })

    it('total이 0이면 0을 반환해야 함', () => {
      expect(calculatePercentage(10, 0)).toBe(0)
      expect(calculatePercentage(0, 0)).toBe(0)
    })

    it('100%를 초과하는 경우를 처리해야 함', () => {
      expect(calculatePercentage(150, 100)).toBe(150)
      expect(calculatePercentage(200, 100)).toBe(200)
    })
  })

  describe('calculateProgress', () => {
    it('정확한 진행률을 소수점 첫째자리까지 계산해야 함', () => {
      expect(calculateProgress(50, 100)).toBe(50.0)
      expect(calculateProgress(1, 3)).toBe(33.3)
      expect(calculateProgress(2, 3)).toBe(66.7)
    })

    it('total이 0이면 0을 반환해야 함', () => {
      expect(calculateProgress(10, 0)).toBe(0)
      expect(calculateProgress(0, 0)).toBe(0)
    })

    it('완료된 항목 수와 전체 항목 수가 같으면 100을 반환해야 함', () => {
      expect(calculateProgress(100, 100)).toBe(100.0)
      expect(calculateProgress(50, 50)).toBe(100.0)
    })

    it('100%를 초과하는 진행률을 처리해야 함', () => {
      expect(calculateProgress(150, 100)).toBe(150.0)
    })
  })

  describe('clamp', () => {
    it('값을 min-max 범위 내로 제한해야 함', () => {
      expect(clamp(50, 0, 100)).toBe(50)
      expect(clamp(-10, 0, 100)).toBe(0)
      expect(clamp(150, 0, 100)).toBe(100)
    })

    it('경계값을 올바르게 처리해야 함', () => {
      expect(clamp(0, 0, 100)).toBe(0)
      expect(clamp(100, 0, 100)).toBe(100)
    })

    it('음수 범위에서도 작동해야 함', () => {
      expect(clamp(-50, -100, 0)).toBe(-50)
      expect(clamp(-150, -100, 0)).toBe(-100)
      expect(clamp(50, -100, 0)).toBe(0)
    })
  })

  describe('clampPercentage', () => {
    it('백분율을 0-100 범위로 제한해야 함', () => {
      expect(clampPercentage(50)).toBe(50)
      expect(clampPercentage(-10)).toBe(0)
      expect(clampPercentage(150)).toBe(100)
    })

    it('경계값을 올바르게 처리해야 함', () => {
      expect(clampPercentage(0)).toBe(0)
      expect(clampPercentage(100)).toBe(100)
    })
  })

  describe('roundToDecimal', () => {
    it('지정된 소수점 자리수로 반올림해야 함', () => {
      expect(roundToDecimal(3.14159, 0)).toBe(3)
      expect(roundToDecimal(3.14159, 1)).toBe(3.1)
      expect(roundToDecimal(3.14159, 2)).toBe(3.14)
      expect(roundToDecimal(3.14159, 3)).toBe(3.142)
    })

    it('기본값은 정수로 반올림해야 함', () => {
      expect(roundToDecimal(3.7)).toBe(4)
      expect(roundToDecimal(3.4)).toBe(3)
    })

    it('음수도 올바르게 처리해야 함', () => {
      expect(roundToDecimal(-3.14159, 2)).toBe(-3.14)
      expect(roundToDecimal(-3.7)).toBe(-4)
    })
  })

  describe('calculateAverage', () => {
    it('정확한 평균을 계산해야 함', () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3.0)
      expect(calculateAverage([10, 20, 30])).toBe(20.0)
    })

    it('소수점 첫째자리까지 반올림해야 함', () => {
      expect(calculateAverage([1, 2, 3])).toBe(2.0)
      expect(calculateAverage([1, 2])).toBe(1.5)
    })

    it('빈 배열이면 0을 반환해야 함', () => {
      expect(calculateAverage([])).toBe(0)
    })

    it('단일 값도 올바르게 처리해야 함', () => {
      expect(calculateAverage([42])).toBe(42.0)
    })

    it('음수 값도 올바르게 처리해야 함', () => {
      expect(calculateAverage([-5, 5])).toBe(0.0)
      expect(calculateAverage([-10, -20, -30])).toBe(-20.0)
    })
  })

  describe('calculateMax', () => {
    it('최대값을 반환해야 함', () => {
      expect(calculateMax([1, 5, 3, 2, 4])).toBe(5)
      expect(calculateMax([100, 50, 75, 25])).toBe(100)
    })

    it('빈 배열이면 0을 반환해야 함', () => {
      expect(calculateMax([])).toBe(0)
    })

    it('단일 값도 올바르게 처리해야 함', () => {
      expect(calculateMax([42])).toBe(42)
    })

    it('음수 값도 올바르게 처리해야 함', () => {
      expect(calculateMax([-1, -5, -3])).toBe(-1)
      expect(calculateMax([-10, 5, -20])).toBe(5)
    })

    it('모든 값이 같으면 그 값을 반환해야 함', () => {
      expect(calculateMax([7, 7, 7, 7])).toBe(7)
    })
  })

  describe('calculateMin', () => {
    it('최소값을 반환해야 함', () => {
      expect(calculateMin([1, 5, 3, 2, 4])).toBe(1)
      expect(calculateMin([100, 50, 75, 25])).toBe(25)
    })

    it('빈 배열이면 0을 반환해야 함', () => {
      expect(calculateMin([])).toBe(0)
    })

    it('단일 값도 올바르게 처리해야 함', () => {
      expect(calculateMin([42])).toBe(42)
    })

    it('음수 값도 올바르게 처리해야 함', () => {
      expect(calculateMin([-1, -5, -3])).toBe(-5)
      expect(calculateMin([-10, 5, -20])).toBe(-20)
    })

    it('모든 값이 같으면 그 값을 반환해야 함', () => {
      expect(calculateMin([7, 7, 7, 7])).toBe(7)
    })
  })
})
