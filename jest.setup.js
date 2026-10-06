// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock Next.js server modules
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(url, init = {}) {
      this.url = url
      this.nextUrl = {
        searchParams: new URL(url).searchParams,
      }
      this.body = init.body
    }
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
    }
  },
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status ?? 200,
      ok: (init?.status ?? 200) >= 200 && (init?.status ?? 200) < 300,
    })),
  },
}))

// Mock fetch
global.fetch = jest.fn()
