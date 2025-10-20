export function isError(err: unknown): err is Error {
  return err instanceof Error
}

export function getErrorMessage(err: unknown, fallback = 'Unknown error'): string {
  if (isError(err)) return err.message
  return fallback
}

// Type guard for error objects that may carry a string code (e.g., Prisma errors)
export function hasErrorCode<T extends string = string>(
  err: unknown,
  code?: T,
): err is { code: T } & object {
  if (!err || typeof err !== 'object') return false
  const obj = err as Record<string, unknown>
  if (typeof obj.code !== 'string') return false
  return code ? obj.code === code : true
}
