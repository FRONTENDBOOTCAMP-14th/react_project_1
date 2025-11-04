// Jest DOM setup
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@testing-library/jest-dom')

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}
