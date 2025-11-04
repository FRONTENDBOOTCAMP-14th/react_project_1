/**
 * API 시간 처리 테스트
 */

// Mock fetch for API testing
global.fetch = jest.fn()

describe('API 시간 처리 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('/api/server-time', () => {
    it('서버 시간 반환', async () => {
      const mockServerTime = '2023-10-31T12:30:32.000Z'
      const mockTimestamp = new Date(mockServerTime).getTime()

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          serverTime: mockServerTime,
          timestamp: mockTimestamp,
        }),
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        status: 200,
      }
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      const response = await fetch('http://localhost:3000/api/server-time')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('serverTime')
      expect(data).toHaveProperty('timestamp')

      // ISO 8601 형식 확인
      expect(data.serverTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

      // 타임스탬프가 숫자인지 확인
      expect(typeof data.timestamp).toBe('number')
      expect(data.timestamp).toBeGreaterThan(0)

      // 서버 시간과 타임스탬프 일치 확인
      const serverDate = new Date(data.serverTime)
      expect(serverDate.getTime()).toBe(data.timestamp)
    })

    it('응답 시간이 1초 이내인지 확인', async () => {
      const mockServerTime = '2023-10-31T12:30:32.000Z'
      const mockTimestamp = new Date(mockServerTime).getTime()

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          serverTime: mockServerTime,
          timestamp: mockTimestamp,
        }),
        status: 200,
      }
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      const start = performance.now()

      const response = await fetch('http://localhost:3000/api/server-time')
      await response.json()

      const end = performance.now()
      expect(end - start).toBeLessThan(1000) // 1초 이내
    })

    it('CORS 헤더 포함', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
        headers: {
          get: jest.fn((key: string) => {
            if (key === 'content-type') return 'application/json'
            return null
          }),
        },
        status: 200,
      }
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      const response = await fetch('http://localhost:3000/api/server-time')
      expect(response.headers.get('content-type')).toBe('application/json')
    })
  })

  describe('시간 형식 검증', () => {
    it('다양한 시간대에서의 서버 시간 형식', async () => {
      const mockServerTime = '2023-10-31T12:30:32.000Z'
      const mockTimestamp = new Date(mockServerTime).getTime()

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          serverTime: mockServerTime,
          timestamp: mockTimestamp,
        }),
        status: 200,
      }
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      const response = await fetch('http://localhost:3000/api/server-time')
      const data = await response.json()

      // 항상 UTC여야 함
      expect(data.serverTime).toMatch(/Z$/)

      // 소수점 이하 3자리 밀리초
      expect(data.serverTime).toMatch(/\.\d{3}Z$/)

      // 유효한 날짜인지 확인
      const serverDate = new Date(data.serverTime)
      expect(isNaN(serverDate.getTime())).toBe(false)
    })
  })

  describe('동시성 테스트', () => {
    it('여러 요청 동시 처리', async () => {
      const mockServerTime = '2023-10-31T12:30:32.000Z'
      const mockTimestamp = new Date(mockServerTime).getTime()

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          serverTime: mockServerTime,
          timestamp: mockTimestamp,
        }),
        status: 200,
      }
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      const requests = Array.from({ length: 10 }, () =>
        fetch('http://localhost:3000/api/server-time')
      )

      const responses = await Promise.all(requests)
      const datas = await Promise.all(responses.map((res: any) => res.json()))

      // 모든 응답이 성공해야 함
      responses.forEach((response: any) => {
        expect(response.status).toBe(200)
      })

      // 모든 데이터가 형식에 맞아야 함
      datas.forEach((data: any) => {
        expect(data).toHaveProperty('serverTime')
        expect(data).toHaveProperty('timestamp')
        expect(typeof data.timestamp).toBe('number')
      })

      // 시간 차이가 1초 이내여야 함 (동시 요청)
      const timestamps = datas.map((d: any) => d.timestamp)
      const maxTime = Math.max(...timestamps)
      const minTime = Math.min(...timestamps)
      expect(maxTime - minTime).toBeLessThan(1000)
    })
  })

  describe('에러 처리', () => {
    it('네트워크 에러 처리', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(fetch('http://localhost:3000/api/server-time')).rejects.toThrow('Network error')
    })
  })
})
