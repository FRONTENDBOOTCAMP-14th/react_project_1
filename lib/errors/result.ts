/**
 * Result 타입 정의 (Rust-style discriminated union)
 * 예외를 던지는 대신 성공/실패를 타입으로 표현
 *
 * @template T - 성공 값의 타입
 * @template E - 에러 값의 타입
 * @example
 * ```typescript
 * const result: Result<string, Error> = ok("success");
 * const errorResult: Result<string, Error> = err(new Error("failed"));
 * ```
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>

/**
 * AsyncResult 타입 - Promise로 감싼 Result
 *
 * @template T - 성공 값의 타입
 * @template E - 에러 값의 타입
 * @example
 * ```typescript
 * const asyncResult: AsyncResult<string, Error> = Promise.resolve(ok("success"));
 * ```
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>

/**
 * Match 핸들러 타입
 *
 * @template T - 입력 성공 값의 타입
 * @template E - 입력 에러 값의 타입
 * @template R - 반환 값의 타입
 * @example
 * ```typescript
 * const handlers: MatchHandlers<string, Error, number> = {
 *   ok: (value) => value.length,
 *   err: (error) => 0
 * };
 * ```
 */
export interface MatchHandlers<T, E, R> {
  /** 성공 케이스 처리 함수 */
  ok: (value: T) => R
  /** 에러 케이스 처리 함수 */
  err: (error: E) => R
}

/**
 * Ok 클래스 - 성공 케이스
 *
 * @template T - 성공 값의 타입
 * @template E - 에러 값의 타입 (사용되지 않음)
 */
export class Ok<T, E> {
  /** 리터럴 타입으로 명시된 구분자 */
  readonly kind = 'Ok' as const

  /**
   * Ok 인스턴스 생성
   * @param value - 성공 값
   */
  constructor(readonly value: T) {}

  /**
   * Ok 타입 가드
   * @returns 항상 true
   */
  isOk(): this is Ok<T, E> {
    return true
  }

  /**
   * Err 타입 가드
   * @returns 항상 false
   */
  isErr(): this is Err<T, E> {
    return false
  }

  /**
   * 성공 값을 변환 (실패는 그대로 전파)
   *
   * @template R - 변환된 값의 타입
   * @param f - 값 변환 함수
   * @returns 변환된 Result
   * @example
   * ```typescript
   * const result = ok("hello").map(s => s.length); // Result<number, Error>
   * ```
   */
  map<R>(f: (value: T) => R): Result<R, E> {
    return new Ok(f(this.value))
  }

  /**
   * 에러를 변환 (성공은 그대로 전파)
   *
   * @template F - 변환된 에러의 타입
   * @param _f - 에러 변환 함수 (Ok에서는 사용되지 않음)
   * @returns 원본 Ok (타입만 변경)
   */
  mapErr<F>(_f: (error: E) => F): Result<T, F> {
    return new Ok(this.value) as unknown as Ok<T, F>
  }

  /**
   * 연속적인 Result 연산을 체인 (flatMap)
   *
   * @template R - 다음 Result의 성공 값 타입
   * @param f - 다음 Result를 반환하는 함수
   * @returns 체이닝된 Result
   * @example
   * ```typescript
   * const result = ok("5").andThen(s => ok(parseInt(s)));
   * ```
   */
  andThen<R>(f: (value: T) => Result<R, E>): Result<R, E> {
    return f(this.value)
  }

  /**
   * 비동기 Result 연산을 체인
   *
   * @template R - 다음 AsyncResult의 성공 값 타입
   * @param f - 다음 AsyncResult를 반환하는 함수
   * @returns 체이닝된 AsyncResult
   * @example
   * ```typescript
   * const result = ok("5").andThenAsync(s => Promise.resolve(ok(parseInt(s))));
   * ```
   */
  async andThenAsync<R>(f: (value: T) => AsyncResult<R, E>): AsyncResult<R, E> {
    return f(this.value)
  }

  /**
   * 패턴 매칭 - 성공/실패 케이스를 명시적으로 처리
   *
   * @template R - 반환 값의 타입
   * @param handlers - 성공/실패 처리 함수 객체
   * @returns 처리된 결과값
   * @example
   * ```typescript
   * const length = ok("hello").match({
   *   ok: (value) => value.length,
   *   err: (error) => 0
   * });
   * ```
   */
  match<R>(handlers: MatchHandlers<T, E, R>): R {
    return handlers.ok(this.value)
  }

  /**
   * 값 추출 (항상 성공)
   *
   * @returns 성공 값
   * @throws 절대 에러를 던지지 않음
   */
  unwrap(): T {
    return this.value
  }

  /**
   * 값 추출 또는 기본값 반환
   *
   * @param _default - 기본값 (Ok에서는 사용되지 않음)
   * @returns 성공 값
   */
  unwrapOr(_default: T): T {
    return this.value
  }

  /**
   * 에러를 기본값으로 변환
   *
   * @param _f - 기본값 생성 함수 (Ok에서는 사용되지 않음)
   * @returns 성공 값
   */
  unwrapOrElse(_f: (error: E) => T): T {
    return this.value
  }
}

/**
 * Err 클래스 - 실패 케이스
 */
export class Err<T, E> {
  readonly kind = 'Err' as const // 리터럴 타입으로 명시
  constructor(readonly error: E) {}

  /**
   * Ok 타입 가드
   */
  isOk(): this is Ok<T, E> {
    return false
  }

  /**
   * Err 타입 가드
   */
  isErr(): this is Err<T, E> {
    return true
  }

  /**
   * 성공 값을 변환 (실패는 그대로 전파)
   */
  map<R>(_f: (value: T) => R): Result<R, E> {
    return this as unknown as Err<R, E>
  }

  /**
   * 에러를 변환
   */
  mapErr<F>(f: (error: E) => F): Result<T, F> {
    return new Err(f(this.error))
  }

  /**
   * 연속적인 Result 연산을 체인 (실패는 전파)
   */
  andThen<R>(_f: (value: T) => Result<R, E>): Result<R, E> {
    return this as unknown as Err<R, E>
  }

  /**
   * 비동기 Result 연산을 체인 (실패는 전파)
   */
  async andThenAsync<R>(_f: (value: T) => AsyncResult<R, E>): AsyncResult<R, E> {
    return this as unknown as Err<R, E>
  }

  /**
   * 패턴 매칭 - 성공/실패 케이스를 명시적으로 처리
   */
  match<R>(handlers: MatchHandlers<T, E, R>): R {
    return handlers.err(this.error)
  }

  /**
   * 값 추출 (에러 발생)
   */
  unwrap(): never {
    throw new Error(`Cannot unwrap Err: ${String(this.error)}`)
  }

  /**
   * 값 추출 또는 기본값 반환
   */
  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  /**
   * 에러를 기본값으로 변환
   */
  unwrapOrElse(f: (error: E) => T): T {
    return f(this.error)
  }
}

/**
 * Ok 팩토리 함수
 */
export function ok<T, E = never>(value: T): Result<T, E> {
  return new Ok(value)
}

/**
 * Err 팩토리 함수
 */
export function err<T = never, E = unknown>(error: E): Result<T, E> {
  return new Err(error)
}

/**
 * 동기 함수를 Result로 래핑
 */
export function tryCatch<T, E = Error>(fn: () => T, onError?: (error: unknown) => E): Result<T, E> {
  try {
    return ok(fn())
  } catch (error) {
    const err = onError ? onError(error) : (error as E)
    return new Err(err)
  }
}

/**
 * 비동기 함수를 AsyncResult로 래핑
 */
export async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T>,
  onError?: (error: unknown) => E
): AsyncResult<T, E> {
  try {
    const value = await fn()
    return ok(value)
  } catch (error) {
    const err = onError ? onError(error) : (error as E)
    return new Err(err)
  }
}

/**
 * Result 배열을 순회하며 모든 Ok 값을 수집
 */
export function collectResults<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = []

  for (const result of results) {
    if (result.isErr()) {
      // Err<T, E>를 Err<T[], E>로 안전하게 캐스팅
      // Err는 T 타입을 실제로 사용하지 않으므로 이 캐스팅은 타입 안전함
      return result as unknown as Result<T[], E>
    }
    values.push(result.unwrap())
  }

  return ok(values)
}

/**
 * Result 배열을 순회하며 첫 번째 Ok 값 반환
 */
export function firstOk<T, E>(results: Result<T, E>[]): Result<T, E> | null {
  for (const result of results) {
    if (result.isOk()) {
      return result
    }
  }
  return null
}
