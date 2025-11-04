/**
 * Result 타입 정의 (Rust 스타일 판별 유니온)
 * 예외를 던지는 대신 성공/실패를 타입으로 표현
 *
 * @template T - 성공 값의 타입
 * @template E - 오류 값의 타입
 * @example
 * ```typescript
 * const result: Result<string, Error> = ok("성공");
 * const errorResult: Result<string, Error> = err(new Error("실패"));
 * ```
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>

/**
 * AsyncResult 타입 - Promise로 감싼 Result
 *
 * @template T - 성공 값의 타입
 * @template E - 오류 값의 타입
 * @example
 * ```typescript
 * const asyncResult: AsyncResult<string, Error> = Promise.resolve(ok("성공"));
 * ```
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>

/**
 * Match 핸들러 타입
 *
 * @template T - 입력 성공 값의 타입
 * @template E - 입력 오류 값의 타입
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
  /** 오류 케이스 처리 함수 */
  err: (error: E) => R
}

/**
 * Ok 클래스 - 성공 케이스
 *
 * @template T - 성공 값의 타입
 * @template E - 오류 값의 타입 (사용되지 않음)
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
   * const result = ok("안녕하세요").map(s => s.length); // Result<number, Error>
   * ```
   */
  map<R>(f: (value: T) => R): Result<R, E> {
    return new Ok(f(this.value))
  }

  /**
   * 오류를 변환 (성공은 그대로 전파)
   *
   * @template F - 변환된 오류의 타입
   * @param _f - 오류 변환 함수 (Ok에서는 사용되지 않음)
   * @returns 원본 Ok (타입만 변경)
   */
  mapErr<F>(_f: (error: E) => F): Result<T, F> {
    return ok(this.value)
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
  andThenAsync<R>(f: (value: T) => AsyncResult<R, E>): AsyncResult<R, E> {
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
   * const length = ok("안녕하세요").match({
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
   * @throws 절대 오류를 던지지 않음
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
   * 실패 시 대안 Result 반환 (성공은 그대로 전파)
   *
   * @template F - 대안 오류의 타입
   * @param _f - 대안 Result를 반환하는 함수 (Ok에서는 사용되지 않음)
   * @returns 원본 Ok
   * @example
   * ```typescript
   * const result = ok("성공").orElse(() => ok("대안"));
   * // Result: ok("성공")
   * ```
   */
  orElse<F>(_f: (error: E) => Result<T, F>): Result<T, F> {
    return ok(this.value)
  }

  /**
   * Ok와 Err를 동시에 변환
   *
   * @template R - 변환된 성공 값의 타입
   * @template F - 변환된 오류의 타입
   * @param okFn - 성공 값 변환 함수
   * @param _errFn - 오류 변환 함수 (Ok에서는 사용되지 않음)
   * @returns 변환된 Result
   * @example
   * ```typescript
   * const result = ok(5).bimap(
   *   n => n * 2,
   *   err => err.toUpperCase()
   * );
   * // Result: ok(10)
   * ```
   */
  bimap<R, F>(okFn: (value: T) => R, _errFn: (error: E) => F): Result<R, F> {
    return ok(okFn(this.value))
  }

  /**
   * 사이드 이펙트 실행 (디버깅용)
   *
   * @param f - 사이드 이펙트 함수
   * @returns 원본 Result
   * @example
   * ```typescript
   * const result = ok("안녕하세요")
   *   .inspect(val => console.log("값:", val))
   *   .map(s => s.length);
   * // 콘솔: "값: 안녕하세요"
   * // Result: ok(5)
   * ```
   */
  inspect(f: (value: T) => void): Result<T, E> {
    f(this.value)
    return this
  }

  /**
   * 다른 Result와 결합하여 튜플로 반환
   *
   * @template U - 다른 Result의 성공 값 타입
   * @param other - 결합할 Result
   * @returns 튜플로 결합된 Result
   * @example
   * ```typescript
   * const result1 = ok(1);
   * const result2 = ok("a");
   * const zipped = result1.zip(result2);
   * // Result: ok([1, "a"])
   * ```
   */
  zip<U>(other: Result<U, E>): Result<[T, U], E> {
    if (other.isErr()) {
      return other as unknown as Result<[T, U], E>
    }
    return ok([this.value, other.unwrap()] as [T, U])
  }

  /**
   * 오류를 기본값으로 변환
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
   *
   * @template R - 변환된 값의 타입
   * @param _f - 값 변환 함수 (Err에서는 사용되지 않음)
   * @returns 새로운 Err 인스턴스 (캐스팅 없이 직접 생성)
   */
  map<R>(_f: (value: T) => R): Result<R, E> {
    return new Err<R, E>(this.error)
  }

  /**
   * 오류를 변환
   *
   * @template F - 변환된 오류의 타입
   * @param f - 오류 변환 함수
   * @returns 변환된 Err
   * @example
   * ```typescript
   * const result = err("실패").mapErr(e => e.toUpperCase()); // Err<string, string>
   * ```
   */
  mapErr<F>(f: (error: E) => F): Result<T, F> {
    return new Err(f(this.error))
  }

  /**
   * 연속적인 Result 연산을 체인 (실패는 전파)
   *
   * @template R - 다음 Result의 성공 값 타입
   * @param _f - 다음 Result를 반환하는 함수 (Err에서는 사용되지 않음)
   * @returns 새로운 Err 인스턴스 (캐스팅 없이 직접 생성)
   */
  andThen<R>(_f: (value: T) => Result<R, E>): Result<R, E> {
    return new Err<R, E>(this.error)
  }

  /**
   * 비동기 Result 연산을 체인 (실패는 전파)
   *
   * @template R - 다음 AsyncResult의 성공 값 타입
   * @param _f - 다음 AsyncResult를 반환하는 함수 (Err에서는 사용되지 않음)
   * @returns 새로운 Err 인스턴스를 담은 Promise
   */
  async andThenAsync<R>(_f: (value: T) => AsyncResult<R, E>): AsyncResult<R, E> {
    return new Err<R, E>(this.error)
  }

  /**
   * 패턴 매칭 - 성공/실패 케이스를 명시적으로 처리
   */
  match<R>(handlers: MatchHandlers<T, E, R>): R {
    return handlers.err(this.error)
  }

  /**
   * 값 추출 (오류 발생)
   *
   * @returns 절대 반환하지 않음 (항상 오류 발생)
   * @throws 원본 오류 또는 래핑된 오류
   */
  unwrap(): never {
    throw this.error instanceof Error
      ? this.error
      : new Error(`Tried to unwrap Err(${JSON.stringify(this.error)})`)
  }

  /**
   * 값 추출 또는 기본값 반환
   */
  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  /**
   * 오류를 기본값으로 변환
   */
  unwrapOrElse(f: (error: E) => T): T {
    return f(this.error)
  }

  /**
   * 실패 시 대안 Result 반환
   *
   * @template F - 대안 오류의 타입
   * @param f - 대안 Result를 반환하는 함수
   * @returns 대안 Result
   * @example
   * ```typescript
   * const result = err("실패").orElse(() => ok("대안"));
   * // Result: ok("대안")
   * ```
   */
  orElse<F>(f: (error: E) => Result<T, F>): Result<T, F> {
    return f(this.error)
  }

  /**
   * Ok와 Err를 동시에 변환
   *
   * @template R - 변환된 성공 값의 타입
   * @template F - 변환된 오류의 타입
   * @param _okFn - 성공 값 변환 함수 (Err에서는 사용되지 않음)
   * @param errFn - 오류 변환 함수
   * @returns 변환된 Result
   * @example
   * ```typescript
   * const result = err("실패").bimap(
   *   n => n * 2,
   *   err => err.toUpperCase()
   * );
   * // Result: err("실패")
   * ```
   */
  bimap<R, F>(_okFn: (value: T) => R, errFn: (error: E) => F): Result<R, F> {
    return err(errFn(this.error))
  }

  /**
   * 사이드 이펙트 실행 (디버깅용)
   *
   * @param _f - 사이드 이펙트 함수 (Err에서는 사용되지 않음)
   * @returns 원본 Result
   * @example
   * ```typescript
   * const result = err("실패")
   *   .inspect(val => console.log("값:", val))
   *   .mapErr(e => e.toUpperCase());
   * // 콘솔 출력 없음
   * // Result: err("실패")
   * ```
   */
  inspect(_f: (value: T) => void): Result<T, E> {
    return this
  }

  /**
   * 다른 Result와 결합하여 튜플로 반환 (Err는 전파)
   *
   * @template U - 다른 Result의 성공 값 타입
   * @param _other - 결합할 Result (Err에서는 사용되지 않음)
   * @returns 원본 Err (타입만 변경)
   * @example
   * ```typescript
   * const result1 = err("오류");
   * const result2 = ok("a");
   * const zipped = result1.zip(result2);
   * // Result: err("오류")
   * ```
   */
  zip<U>(_other: Result<U, E>): Result<[T, U], E> {
    return new Err<[T, U], E>(this.error)
  }
}

/**
 * Ok 팩토리 함수
 *
 * @template T - 성공 값의 타입
 * @template E - 오류 값의 타입 (기본값: never)
 * @param value - 성공 값
 * @returns Ok 인스턴스
 * @example
 * ```typescript
 * const result = ok("성공");
 * ```
 */
export function ok<T, E = never>(value: T): Result<T, E> {
  return new Ok(value)
}

/**
 * Err 팩토리 함수
 *
 * @template T - 성공 값의 타입 (기본값: never)
 * @template E - 오류 값의 타입 (기본값: unknown)
 * @param error - 오류 값
 * @returns Err 인스턴스
 * @example
 * ```typescript
 * const result = err("실패");
 * ```
 */
export function err<T = never, E = unknown>(error: E): Result<T, E> {
  return new Err(error)
}

/**
 * 동기 함수를 Result로 래핑
 *
 * @template T - 함수 반환 값의 타입
 * @template E - 오류 값의 타입 (기본값: Error)
 * @param fn - 래핑할 동기 함수
 * @param onError - 오류 변환 함수 (선택 사항)
 * @returns Result로 래핑된 결과
 * @example
 * ```typescript
 * const result = tryCatch(() => JSON.parse('{"a": 1}'));
 * const customResult = tryCatch(() => JSON.parse('invalid'), () => "파싱 실패");
 * ```
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
 *
 * @template T - 함수 반환 값의 타입
 * @template E - 오류 값의 타입 (기본값: Error)
 * @param fn - 래핑할 비동기 함수
 * @param onError - 오류 변환 함수 (선택 사항)
 * @returns AsyncResult로 래핑된 결과
 * @example
 * ```typescript
 * const result = await tryCatchAsync(async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * });
 * ```
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
 *
 * @template T - 성공 값의 타입
 * @template E - 오류 값의 타입
 * @param results - Result 배열
 * @returns 모든 Ok 값들의 배열 또는 첫 번째 Err
 * @example
 * ```typescript
 * const results = [ok(1), ok(2), ok(3)];
 * const collected = collectResults(results); // Ok([1, 2, 3])
 * ```
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
 * Result 배열을 순회하며 모든 Ok 값을 조합하여 반환
 *
 * @template T - 성공 값의 타입
 * @template E - 오류 값의 타입
 * @template R - 조합된 결과의 타입
 * @param results - Result 배열
 * @param combine - 성공 값들을 조합하는 함수
 * @returns 조합된 결과 또는 첫 번째 Err
 * @example
 * ```typescript
 * const results = [ok(1), ok(2), ok(3)];
 * const sum = allOk(results, values => values.reduce((a, b) => a + b, 0)); // Ok(6)
 * ```
 */
export function allOk<T, E, R>(results: Result<T, E>[], combine: (values: T[]) => R): Result<R, E> {
  const collected = collectResults(results)
  if (collected.isOk()) {
    return ok(combine(collected.unwrap()))
  }
  return collected as Result<R, E>
}

/**
 * Result 배열을 순회하며 첫 번째 Ok 값 반환
 *
 * @template T - 성공 값의 타입
 * @template E - 오류 값의 타입
 * @param results - Result 배열
 * @returns 첫 번째 Ok 값 또는 null
 * @example
 * ```typescript
 * const results = [err('오류1'), ok('성공'), err('오류2')];
 * const first = firstOk(results); // Ok('성공')
 * ```
 */
export function firstOk<T, E>(results: Result<T, E>[]): Result<T, E> | null {
  for (const result of results) {
    if (result.isOk()) {
      return result
    }
  }
  return null
}

/**
 * Result 배열을 순회하며 첫 번째 Err 값 반환
 *
 * @template T - 성공 값의 타입
 * @template E - 오류 값의 타입
 * @param results - Result 배열
 * @returns 첫 번째 Err 값 또는 null
 * @example
 * ```typescript
 * const results = [ok('성공1'), err('오류'), ok('성공2')];
 * const first = firstErr(results); // Err('오류')
 * ```
 */
export function firstErr<T, E>(results: Result<T, E>[]): Result<T, E> | null {
  for (const result of results) {
    if (result.isErr()) {
      return result
    }
  }
  return null
}

/**
 * 중첩된 Result를 평탄화
 *
 * @template T - 내부 성공 값의 타입
 * @template E - 오류 값의 타입
 * @param result - 중첩된 Result
 * @returns 평탄화된 Result
 * @example
 * ```typescript
 * const nested = ok(ok(5));
 * const flat = flatten(nested); // ok(5)
 *
 * const nestedErr = ok(err("실패"));
 * const flatErr = flatten(nestedErr); // err("실패")
 *
 * const outerErr = err("외부 실패");
 * const flatOuterErr = flatten(outerErr); // err("외부 실패")
 * ```
 */
export function flatten<T, E>(result: Result<Result<T, E>, E>): Result<T, E> {
  if (result.isErr()) {
    return result as unknown as Result<T, E>
  }
  return result.unwrap()
}
