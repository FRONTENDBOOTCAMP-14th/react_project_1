import {
  allOk,
  collectResults,
  err,
  firstErr,
  firstOk,
  flatten,
  ok,
  tryCatch,
  tryCatchAsync,
  type Result,
} from '../result'

describe('Result', () => {
  describe('Ok', () => {
    it('Ok 인스턴스를 생성한다', () => {
      const result = ok('성공')
      expect(result.isOk()).toBe(true)
      expect(result.isErr()).toBe(false)
      expect(result.unwrap()).toBe('성공')
    })

    it('map으로 값을 변환한다', () => {
      const result = ok('안녕').map(s => s.length)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(2)
    })

    it('mapErr 호출 시 오류 타입을 보존한다', () => {
      const result = ok('안녕').mapErr((_e: string) => _e.toUpperCase())
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('안녕')
    })

    it('andThen으로 체이닝한다', () => {
      const result = ok('5').andThen(s => ok(parseInt(s)))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(5)
    })

    it('andThenAsync로 비동기 체이닝한다', async () => {
      const result = await ok('5').andThenAsync(s => Promise.resolve(ok(parseInt(s))))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(5)
    })

    it('match로 분기 처리한다', () => {
      const result = ok('안녕').match({
        ok: value => value.length,
        err: _error => 0,
      })
      expect(result).toBe(2)
    })

    it('unwrapOr는 원본 값을 반환한다', () => {
      const result = ok('안녕').unwrapOr('기본값')
      expect(result).toBe('안녕')
    })

    it('unwrapOrElse는 원본 값을 반환한다', () => {
      const result = ok('안녕').unwrapOrElse(_error => '기본값')
      expect(result).toBe('안녕')
    })
  })

  describe('Err', () => {
    it('Err 인스턴스를 생성한다', () => {
      const result = err('오류')
      expect(result.isOk()).toBe(false)
      expect(result.isErr()).toBe(true)
    })

    it('map 호출 시 오류를 전파한다', () => {
      const result = err<string, string>('오류').map((_s: string) => _s.length.toString())
      expect(result.isErr()).toBe(true)
      expect(result.match({ ok: _v => _v, err: e => e })).toBe('오류')
    })

    it('mapErr로 오류를 변환한다', () => {
      const result = err('오류').mapErr(e => e.toUpperCase())
      expect(result.isErr()).toBe(true)
      expect(result.match({ ok: v => v, err: e => e })).toBe('오류')
    })

    it('andThen 체이닝 시 오류를 전파한다', () => {
      const result = err<string, string>('오류').andThen((_s: string) => ok(_s.length.toString()))
      expect(result.isErr()).toBe(true)
      expect(result.match({ ok: _v => _v, err: e => e })).toBe('오류')
    })

    it('andThenAsync 체이닝 시 오류를 전파한다', async () => {
      const result = await err<string, string>('오류').andThenAsync((_s: string) =>
        Promise.resolve(ok(_s.length.toString()))
      )
      expect(result.isErr()).toBe(true)
      expect(result.match({ ok: _v => _v, err: e => e })).toBe('오류')
    })

    it('match로 분기 처리한다', () => {
      const result = err<string, string>('오류').match({
        ok: (_value: string) => _value.length.toString(),
        err: _error => '0',
      })
      expect(result).toBe('0')
    })

    it('unwrap 호출 시 예외를 던진다', () => {
      expect(() => err('오류').unwrap()).toThrow('Tried to unwrap Err("오류")')
    })

    it('Error 인스턴스면 원본 에러를 던진다', () => {
      const originalError = new Error('테스트 오류')
      expect(() => err(originalError).unwrap()).toThrow('테스트 오류')
    })

    it('unwrapOr는 기본값을 반환한다', () => {
      const result = err<string, string>('오류').unwrapOr('기본값')
      expect(result).toBe('기본값')
    })

    it('unwrapOrElse는 계산된 값을 반환한다', () => {
      const result = err<string, string>('오류').unwrapOrElse(_error => '기본값')
      expect(result).toBe('기본값')
    })
  })

  describe('collectResults', () => {
    it('모든 Ok 값을 수집한다', () => {
      const results = [ok(1), ok(2), ok(3)]
      const collected = collectResults(results)
      expect(collected.isOk()).toBe(true)
      expect(collected.unwrap()).toEqual([1, 2, 3])
    })

    it('첫 번째 Err를 반환한다', () => {
      const results: Result<number, string>[] = [ok(1), err<number, string>('오류'), ok(3)]
      const collected = collectResults(results)
      expect(collected.isErr()).toBe(true)
      expect(
        collected.match({
          ok: (_v: number[]) => '오류',
          err: (e: string) => e,
        })
      ).toBe('오류')
    })

    it('빈 배열을 처리한다', () => {
      const results: Result<number, string>[] = []
      const collected = collectResults(results)
      expect(collected.isOk()).toBe(true)
      expect(collected.unwrap()).toEqual([])
    })
  })

  describe('allOk', () => {
    it('모든 Ok 값을 조합한다', () => {
      const results = [ok(1), ok(2), ok(3)]
      const sum = allOk(results, values => values.reduce((a, b) => a + b, 0))
      expect(sum.isOk()).toBe(true)
      expect(sum.unwrap()).toBe(6)
    })

    it('조합 중 첫 번째 Err를 반환한다', () => {
      const results = [ok(1), err<number, number>(123), ok(3)]
      const sum = allOk(results, values => values.reduce((a, b) => a + b, 0))
      expect(sum.isErr()).toBe(true)
      expect(sum.match({ ok: _v => _v, err: e => e })).toBe(123)
    })

    it('사용자 함수로 값을 변환한다', () => {
      const results = [ok('안녕'), ok('세계')]
      const combined = allOk(results, values => values.join(' '))
      expect(combined.isOk()).toBe(true)
      expect(combined.unwrap()).toBe('안녕 세계')
    })
  })

  describe('firstOk', () => {
    it('첫 번째 Ok를 반환한다', () => {
      const results = [err('오류1'), ok('성공'), err('오류2')]
      const first = firstOk(results)
      expect(first?.isOk()).toBe(true)
      expect(first?.unwrap()).toBe('성공')
    })

    it('Ok가 없으면 null을 반환한다', () => {
      const results = [err('오류1'), err('오류2')]
      const first = firstOk(results)
      expect(first).toBe(null)
    })

    it('배열이 Ok로 시작하면 그 값을 반환한다', () => {
      const results = [ok('첫번째'), err('오류'), ok('두번째')]
      const first = firstOk(results)
      expect(first?.isOk()).toBe(true)
      expect(first?.unwrap()).toBe('첫번째')
    })
  })

  describe('firstErr', () => {
    it('첫 번째 Err를 반환한다', () => {
      const results = [ok('성공1'), err('오류'), ok('성공2')]
      const first = firstErr(results)
      expect(first?.isErr()).toBe(true)
      expect(first?.match({ ok: v => v, err: e => e })).toBe('오류')
    })

    it('Err가 없으면 null을 반환한다', () => {
      const results = [ok('성공1'), ok('성공2')]
      const first = firstErr(results)
      expect(first).toBe(null)
    })

    it('배열이 Err로 시작하면 그 값을 반환한다', () => {
      const results = [err('첫번째'), ok('성공'), err('두번째')]
      const first = firstErr(results)
      expect(first?.isErr()).toBe(true)
      expect(first?.match({ ok: v => v, err: e => e })).toBe('첫번째')
    })
  })

  describe('tryCatch', () => {
    it('함수가 성공하면 Ok를 반환한다', () => {
      const result = tryCatch(() => '성공')
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('성공')
    })

    it('함수가 예외를 던지면 Err를 반환한다', () => {
      const result = tryCatch(() => {
        throw new Error('테스트 오류')
      })
      expect(result.isErr()).toBe(true)
      expect(result.match({ ok: v => v, err: e => e.message })).toBe('테스트 오류')
    })

    it('커스텀 에러 핫들러를 사용한다', () => {
      const result = tryCatch(
        () => {
          throw '문자열 오류'
        },
        error => `커스텀: ${error}`
      )
      expect(result.isErr()).toBe(true)
      expect(result.match({ ok: _v => _v, err: e => e })).toBe('커스텀: 문자열 오류')
    })
  })

  describe('tryCatchAsync', () => {
    it('비동기 함수가 성공하면 Ok를 반환한다', async () => {
      const result = await tryCatchAsync(async () => '성공')
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('성공')
    })

    it('비동기 함수가 예외를 던지면 Err를 반환한다', async () => {
      const result = await tryCatchAsync(async () => {
        throw new Error('비동기 오류')
      })
      expect(result.isErr()).toBe(true)
      expect(result.match({ ok: v => v, err: e => e.message })).toBe('비동기 오류')
    })

    it('비동기 커스텀 에러 핸들러를 사용한다', async () => {
      const result = await tryCatchAsync(
        async () => {
          throw '비동기 문자열 오류'
        },
        error => `비동기 커스텀: ${error}`
      )
      expect(result.isErr()).toBe(true)
      expect(result.match({ ok: _v => _v, err: e => e })).toBe('비동기 커스텀: 비동기 문자열 오류')
    })
  })

  describe('타입 안정성', () => {
    it('연산 전반에 걸쳐 타입 정보를 유지한다', () => {
      const result: Result<string, Error> = ok('안녕')
      const mapped: Result<number, Error> = result.map((s: string) => s.length)
      const chained: Result<boolean, Error> = mapped.andThen((n: number) => ok(n > 1))

      expect(chained.isOk()).toBe(true)
      expect(chained.unwrap()).toBe(true)
    })

    it('서로 다른 오류 타입을 올바르게 처리한다', () => {
      const stringErr: Result<string, string> = err('문자열 오류')
      const numberErr: Result<string, number> = err(123)

      expect(stringErr.isErr()).toBe(true)
      expect(numberErr.isErr()).toBe(true)
    })
  })

  describe('orElse', () => {
    it('Ok는 대안을 무시하고 원본을 반환한다', () => {
      const result = ok('성공').orElse(() => ok('대안'))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('성공')
    })

    it('Err는 대안 Result를 반환한다', () => {
      const result = err<string, string>('실패').orElse(() => ok('대안'))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('대안')
    })

    it('Err에서 다른 Err로 대안 반환이 가능하다', () => {
      const result = err<string, string>('첫번째 실패').orElse(e => err(`${e}에서 두번째 실패`))
      expect(result.isErr()).toBe(true)
      expect(result.match({ ok: v => v, err: e => e })).toBe('첫번째 실패에서 두번째 실패')
    })

    it('오류 타입을 변환할 수 있다', () => {
      const result = err<string, string>('실패').orElse<number>(() => err<string, number>(404))
      expect(result.isErr()).toBe(true)
      expect(result.match({ ok: v => v, err: e => String(e) })).toBe('404')
    })
  })

  describe('bimap', () => {
    it('Ok는 성공 변환 함수를 적용한다', () => {
      const result = ok(5).bimap(
        n => n * 2,
        (e: string) => e.toUpperCase()
      )
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(10)
    })

    it('Err는 오류 변환 함수를 적용한다', () => {
      const result = err<number, string>('error').bimap(
        (n: number) => n * 2,
        e => e.toUpperCase()
      )
      expect(result.isErr()).toBe(true)
      expect(result.match({ ok: (v: number) => v.toString(), err: e => e })).toBe('ERROR')
    })

    it('성공과 오류 타입을 동시에 변환할 수 있다', () => {
      const okResult = ok<string, number>('5').bimap(
        s => parseInt(s),
        n => `Error: ${n}`
      )
      expect(okResult.isOk()).toBe(true)
      expect(okResult.unwrap()).toBe(5)

      const errResult = err<string, number>(404).bimap(
        (s: string) => parseInt(s),
        n => `Error: ${n}`
      )
      expect(errResult.isErr()).toBe(true)
      expect(errResult.match({ ok: (v: number) => v.toString(), err: e => e })).toBe('Error: 404')
    })
  })

  describe('inspect', () => {
    it('Ok는 사이드 이펙트를 실행하고 원본을 반환한다', () => {
      let sideEffect = ''
      const result = ok('안녕하세요')
        .inspect(val => {
          sideEffect = val
        })
        .map(s => s.length)

      expect(sideEffect).toBe('안녕하세요')
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(5)
    })

    it('Err는 사이드 이펙트를 실행하지 않는다', () => {
      let sideEffect = ''
      const result = err<string, string>('실패').inspect(val => {
        sideEffect = val
      })

      expect(sideEffect).toBe('')
      expect(result.isErr()).toBe(true)
    })

    it('체이닝 중간에 디버깅을 위해 사용할 수 있다', () => {
      const logs: number[] = []
      const result = ok(1)
        .map(n => n + 1)
        .inspect(n => logs.push(n))
        .map(n => n * 2)
        .inspect(n => logs.push(n))
        .map(n => n + 10)

      expect(logs).toEqual([2, 4])
      expect(result.unwrap()).toBe(14)
    })
  })

  describe('zip', () => {
    it('두 Ok를 튜플로 결합한다', () => {
      const result1 = ok(1)
      const result2 = ok('a')
      const zipped = result1.zip(result2)

      expect(zipped.isOk()).toBe(true)
      expect(zipped.unwrap()).toEqual([1, 'a'])
    })

    it('첫 번째가 Err면 Err를 반환한다', () => {
      const result1 = err<number, string>('오류')
      const result2 = ok('a')
      const zipped = result1.zip(result2)

      expect(zipped.isErr()).toBe(true)
      expect(zipped.match({ ok: (v: [number, string]) => v.toString(), err: e => e })).toBe('오류')
    })

    it('두 번째가 Err면 Err를 반환한다', () => {
      const result1: Result<number, string> = ok(1)
      const result2: Result<string, string> = err<string, string>('오류')
      const zipped = result1.zip<string>(result2)

      expect(zipped.isErr()).toBe(true)
      expect(zipped.match({ ok: (v: [number, string]) => v.toString(), err: e => e })).toBe('오류')
    })

    it('둘 다 Err면 첫 번째 Err를 반환한다', () => {
      const result1 = err<number, string>('첫번째 오류')
      const result2 = err<string, string>('두번째 오류')
      const zipped = result1.zip(result2)

      expect(zipped.isErr()).toBe(true)
      expect(zipped.match({ ok: (v: [number, string]) => v.toString(), err: e => e })).toBe(
        '첫번째 오류'
      )
    })

    it('여러 번 체이닝할 수 있다', () => {
      const r1 = ok(1)
      const r2 = ok('a')
      const r3 = ok(true)

      const zipped = r1
        .zip(r2)
        .andThen(([n, s]) => ok([n, s, r3.unwrap()] as [number, string, boolean]))

      expect(zipped.isOk()).toBe(true)
      expect(zipped.unwrap()).toEqual([1, 'a', true])
    })
  })

  describe('flatten', () => {
    it('중첩된 Ok를 평탄화한다', () => {
      const nested = ok(ok(5))
      const flat = flatten(nested)

      expect(flat.isOk()).toBe(true)
      expect(flat.unwrap()).toBe(5)
    })

    it('내부가 Err인 Ok를 평탄화한다', () => {
      const nested = ok(err<number, string>('실패'))
      const flat = flatten(nested)

      expect(flat.isErr()).toBe(true)
      expect(flat.match({ ok: (v: number) => v.toString(), err: e => e })).toBe('실패')
    })

    it('외부가 Err면 Err를 반환한다', () => {
      const nested = err<Result<number, string>, string>('외부 실패')
      const flat = flatten(nested)

      expect(flat.isErr()).toBe(true)
      expect(flat.match({ ok: (v: number) => v.toString(), err: e => e })).toBe('외부 실패')
    })

    it('andThen과 함께 사용할 수 있다', () => {
      const result = ok('5')
        .andThen(s => ok(parseInt(s)))
        .andThen(n => ok(ok(n * 2)))

      const flat = flatten(result)
      expect(flat.isOk()).toBe(true)
      expect(flat.unwrap()).toBe(10)
    })
  })
})
