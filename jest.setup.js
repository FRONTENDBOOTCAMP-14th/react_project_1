// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock Next.js server modules
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(url) {
      this.url = url
      this.nextUrl = {
        searchParams: new URL(url).searchParams,
      }
    }
  },
  NextResponse: {
    json: jest.fn(data => ({
      json: async () => data,
      status: 200,
      ok: true,
    })),
  },
}))

// Mock fetch
global.fetch = jest.fn()
