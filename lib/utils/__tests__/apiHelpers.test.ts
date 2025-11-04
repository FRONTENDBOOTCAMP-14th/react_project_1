/**
 * API 헬퍼 함수 테스트
 */

import {
    getBooleanParam,
    getPaginationParams,
    getStringParam,
    validateGoalCreation,
    validateMemberCreation,
    withPagination,
} from '../apiHelpers'

// Mock NextRequest
const createMockRequest = (searchParams: Record<string, string>) => {
  const url = new URL('http://localhost:3000/api/test')
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return {
    url: url.toString(),
    nextUrl: {
      searchParams: url.searchParams,
    },
    cookies: new Map(),
    page: new Map(),
    ua: { isBot: false },
    ip: '127.0.0.1',
    geo: {},
    body: null,
    method: 'GET',
    headers: new Headers(),
    clone: jest.fn(),
    text: jest.fn(),
    json: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    arrayBuffer: jest.fn(),
    cache: 'default',
    credentials: 'same-origin',
    destination: '',
    integrity: '',
    keepalive: false,
    mode: 'cors',
    redirect: 'follow',
    referrer: '',
    referrerPolicy: '',
    signal: new AbortController().signal,
  } as any
}

describe('API Helpers', () => {
  describe('getPaginationParams', () => {
    it('기본값을 올바르게 반환해야 함', () => {
      const request = createMockRequest({})
      const result = getPaginationParams(request)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.skip).toBe(0)
    })

    it('페이지와 limit을 올바르게 계산해야 함', () => {
      const request = createMockRequest({ page: '3', limit: '10' })
      const result = getPaginationParams(request)

      expect(result.page).toBe(3)
      expect(result.limit).toBe(10)
      expect(result.skip).toBe(20) // (3-1) * 10
    })

    it('page가 1 미만이면 1로 보정해야 함', () => {
      const request = createMockRequest({ page: '0', limit: '10' })
      const result = getPaginationParams(request)

      expect(result.page).toBe(1)
      expect(result.skip).toBe(0)
    })

    it('limit가 100을 초과하면 100으로 보정해야 함', () => {
      const request = createMockRequest({ page: '1', limit: '150' })
      const result = getPaginationParams(request)

      expect(result.limit).toBe(100)
    })

    it('limit가 1 미만이면 1로 보정해야 함', () => {
      const request = createMockRequest({ page: '1', limit: '0' })
      const result = getPaginationParams(request)

      expect(result.limit).toBe(1)
    })

    it('문자열 파라미터를 숫자로 변환해야 함', () => {
      const request = createMockRequest({ page: '5', limit: '25' })
      const result = getPaginationParams(request)

      expect(result.page).toBe(5)
      expect(result.limit).toBe(25)
      expect(result.skip).toBe(100) // (5-1) * 25
    })
  })

  describe('getBooleanParam', () => {
    it('true 문자열을 true로 변환해야 함', () => {
      const searchParams = new URLSearchParams('?active=true')
      const result = getBooleanParam(searchParams, 'active')

      expect(result).toBe(true)
    })

    it('false 문자열을 false로 변환해야 함', () => {
      const searchParams = new URLSearchParams('?active=false')
      const result = getBooleanParam(searchParams, 'active')

      expect(result).toBe(false)
    })

    it('다른 문자열을 false로 변환해야 함', () => {
      const searchParams = new URLSearchParams('?active=maybe')
      const result = getBooleanParam(searchParams, 'active')

      expect(result).toBe(false)
    })

    it('파라미터가 없으면 null을 반환해야 함', () => {
      const searchParams = new URLSearchParams('')
      const result = getBooleanParam(searchParams, 'active')

      expect(result).toBe(null)
    })
  })

  describe('getStringParam', () => {
    it('문자열 파라미터를 반환해야 함', () => {
      const searchParams = new URLSearchParams('?name=test')
      const result = getStringParam(searchParams, 'name')

      expect(result).toBe('test')
    })

    it('파라미터가 없으면 null을 반환해야 함', () => {
      const searchParams = new URLSearchParams('')
      const result = getStringParam(searchParams, 'name')

      expect(result).toBe(null)
    })

    it('빈 문자열도 반환해야 함', () => {
      const searchParams = new URLSearchParams('?name=')
      const result = getStringParam(searchParams, 'name')

      expect(result).toBe('')
    })
  })

  describe('withPagination', () => {
    it('페이지네이션된 응답을 반환해야 함', async () => {
      const mockItems = [{ id: 1 }, { id: 2 }]
      const mockTotal = 50
      const pagination = { page: 1, limit: 20, skip: 0 }

      const findManyQuery = Promise.resolve(mockItems)
      const countQuery = Promise.resolve(mockTotal)

      const response = await withPagination(findManyQuery, countQuery, pagination)
      const result = await response.json()

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        data: mockItems,
        count: 2,
        pagination: {
          page: 1,
          limit: 20,
          total: 50,
          totalPages: 3, // Math.ceil(50/20)
        },
      })
    })

    it('마지막 페이지의 totalPages를 올바르게 계산해야 함', async () => {
      const mockItems = [{ id: 1 }]
      const mockTotal = 21
      const pagination = { page: 2, limit: 10, skip: 10 }

      const findManyQuery = Promise.resolve(mockItems)
      const countQuery = Promise.resolve(mockTotal)

      const response = await withPagination(findManyQuery, countQuery, pagination)
      const result = await response.json()

      expect(result.data.pagination.totalPages).toBe(3) // Math.ceil(21/10)
    })

    it('빈 결과를 올바르게 처리해야 함', async () => {
      const mockItems: unknown[] = []
      const mockTotal = 0
      const pagination = { page: 1, limit: 20, skip: 0 }

      const findManyQuery = Promise.resolve(mockItems)
      const countQuery = Promise.resolve(mockTotal)

      const response = await withPagination(findManyQuery, countQuery, pagination)
      const result = await response.json()

      expect(result.data.count).toBe(0)
      expect(result.data.pagination.totalPages).toBe(0)
    })
  })

  describe('validateMemberCreation', () => {
    it('유효한 데이터를 통과시켜야 함', () => {
      const data = {
        clubId: 'club123',
        userId: 'user123',
        role: 'member',
      }

      const errors = validateMemberCreation(data)

      expect(errors).toHaveLength(0)
    })

    it('clubId가 없으면 에러를 반환해야 함', () => {
      const data = {
        userId: 'user123',
        role: 'member',
      }

      const errors = validateMemberCreation(data)

      expect(errors).toContain('유효한 커뮤니티 ID가 필요합니다.')
    })

    it('userId가 없으면 에러를 반환해야 함', () => {
      const data = {
        clubId: 'club123',
        role: 'member',
      }

      const errors = validateMemberCreation(data)

      expect(errors).toContain('유효한 사용자 ID가 필요합니다.')
    })

    it('잘못된 role이면 에러를 반환해야 함', () => {
      const data = {
        clubId: 'club123',
        userId: 'user123',
        role: 'invalid',
      }

      const errors = validateMemberCreation(data)

      expect(errors).toContain('유효한 역할을 선택해주세요.')
    })

    it('여러 에러를 동시에 반환해야 함', () => {
      const data = {
        role: 'invalid',
      }

      const errors = validateMemberCreation(data)

      expect(errors).toHaveLength(3)
      expect(errors).toContain('유효한 커뮤니티 ID가 필요합니다.')
      expect(errors).toContain('유효한 사용자 ID가 필요합니다.')
      expect(errors).toContain('유효한 역할을 선택해주세요.')
    })

    it('role이 없어도 통과해야 함', () => {
      const data = {
        clubId: 'club123',
        userId: 'user123',
      }

      const errors = validateMemberCreation(data)

      expect(errors).toHaveLength(0)
    })
  })

  describe('validateGoalCreation', () => {
    it('유효한 데이터를 통과시켜야 함', () => {
      const data = {
        ownerId: 'user123',
        title: '목표 제목',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }

      const errors = validateGoalCreation(data)

      expect(errors).toHaveLength(0)
    })

    it('ownerId가 없으면 에러를 반환해야 함', () => {
      const data = {
        title: '목표 제목',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }

      const errors = validateGoalCreation(data)

      expect(errors).toContain('목표 소유자 ID가 필요합니다.')
    })

    it('title이 없으면 에러를 반환해야 함', () => {
      const data = {
        ownerId: 'user123',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }

      const errors = validateGoalCreation(data)

      expect(errors).toContain('목표 제목은 1-100자 사이여야 합니다.')
    })

    it('title이 100자를 초과하면 에러를 반환해야 함', () => {
      const data = {
        ownerId: 'user123',
        title: 'a'.repeat(101),
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }

      const errors = validateGoalCreation(data)

      expect(errors).toContain('목표 제목은 1-100자 사이여야 합니다.')
    })

    it('시작일이 없으면 에러를 반환해야 함', () => {
      const data = {
        ownerId: 'user123',
        title: '목표 제목',
        endDate: '2024-12-31',
      }

      const errors = validateGoalCreation(data)

      expect(errors).toContain('시작일과 종료일이 필요합니다.')
    })

    it('종료일이 없으면 에러를 반환해야 함', () => {
      const data = {
        ownerId: 'user123',
        title: '목표 제목',
        startDate: '2024-01-01',
      }

      const errors = validateGoalCreation(data)

      expect(errors).toContain('시작일과 종료일이 필요합니다.')
    })

    it('유효하지 않은 날짜 형식이면 에러를 반환해야 함', () => {
      const data = {
        ownerId: 'user123',
        title: '목표 제목',
        startDate: 'invalid-date',
        endDate: '2024-12-31',
      }

      const errors = validateGoalCreation(data)

      expect(errors).toContain('유효한 날짜 형식이어야 합니다.')
    })

    it('시작일이 종료일보다 늦으면 에러를 반환해야 함', () => {
      const data = {
        ownerId: 'user123',
        title: '목표 제목',
        startDate: '2024-12-31',
        endDate: '2024-01-01',
      }

      const errors = validateGoalCreation(data)

      expect(errors).toContain('시작일은 종료일 이전이어야 합니다.')
    })

    it('시작일과 종료일이 같으면 에러를 반환해야 함', () => {
      const data = {
        ownerId: 'user123',
        title: '목표 제목',
        startDate: '2024-01-01',
        endDate: '2024-01-01',
      }

      const errors = validateGoalCreation(data)

      expect(errors).toContain('시작일은 종료일 이전이어야 합니다.')
    })

    it('Date 객체도 처리해야 함', () => {
      const data = {
        ownerId: 'user123',
        title: '목표 제목',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      }

      const errors = validateGoalCreation(data)

      expect(errors).toHaveLength(0)
    })

    it('여러 에러를 동시에 반환해야 함', () => {
      const data = {}

      const errors = validateGoalCreation(data)

      expect(errors.length).toBeGreaterThan(1)
      expect(errors).toContain('목표 소유자 ID가 필요합니다.')
      expect(errors).toContain('목표 제목은 1-100자 사이여야 합니다.')
      expect(errors).toContain('시작일과 종료일이 필요합니다.')
    })
  })
})
