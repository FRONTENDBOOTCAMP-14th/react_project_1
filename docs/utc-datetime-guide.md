# UTC 기반 날짜/시간 처리 가이드

## 개요

서버와 클라이언트 간 일관된 날짜/시간 처리를 위해 UTC 기반 시스템을 구축했습니다.
모든 날짜 데이터는 UTC 기준으로 저장되고 처리되며, 필요시 사용자 타임존으로 변환하여 표시합니다.

## 핵심 원칙

1. **서버 저장**: 모든 날짜는 UTC ISO 8601 형식으로 저장 (`2025-10-20T14:30:00.000Z`)
2. **클라이언트 전송**: API 요청 시 ISO 8601 형식으로 전송
3. **화면 표시**: UTC 기준으로 표시하되, 필요시 로컬 타임존 변환
4. **Input 처리**: `datetime-local` input은 UTC 기준으로 변환

## 주요 유틸리티 함수

### 1. 서버 시간 가져오기

```typescript
import { getServerTime } from '@/lib/utils'

// 서버의 현재 UTC 시간 가져오기
const serverTime = await getServerTime()
```

### 2. 날짜 포맷팅

#### UTC 기준 포맷팅

```typescript
import { formatDateUTC, formatDateRangeUTC } from '@/lib/utils'

// 단일 날짜
formatDateUTC('2025-10-20T14:30:00.000Z')
// "2025년 10월 20일 14:30" (UTC 기준)

formatDateUTC('2025-10-20T14:30:00.000Z', false)
// "2025년 10월 20일" (시간 제외)

// 날짜 범위
formatDateRangeUTC('2025-10-20T14:00:00Z', '2025-10-20T18:00:00Z')
// "2025년 10월 20일 14:00 ~ 18:00"
```

#### 로컬 타임존 포맷팅 (기존 함수)

```typescript
import { formatDate, formatDateRange } from '@/lib/utils'

// 로컬 타임존 기준으로 표시
formatDate('2025-10-20T05:00:00.000Z')
// 한국: "2025년 10월 20일 14:00" (UTC+9)
```

### 3. datetime-local Input 처리

#### Input에 값 설정

```typescript
import { toDatetimeLocalString } from '@/lib/utils'

const [formData, setFormData] = useState({
  startDate: toDatetimeLocalString(round?.startDate), // UTC -> datetime-local 형식
})

// JSX
<input
  type="datetime-local"
  value={formData.startDate}
  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
/>
```

#### 서버에 전송

```typescript
import { fromDatetimeLocalString } from '@/lib/utils'

const response = await fetch('/api/rounds', {
  method: 'POST',
  body: JSON.stringify({
    startDate: formData.startDate
      ? fromDatetimeLocalString(formData.startDate) // datetime-local -> UTC ISO
      : null,
  }),
})
```

### 4. UTC 날짜 범위 생성

```typescript
import { getUTCDayRange, getUTCMonthRange } from '@/lib/utils'

// 하루 범위 (00:00:00 ~ 23:59:59.999 UTC)
const { start, end } = getUTCDayRange(new Date('2025-10-20'))
// start: 2025-10-20T00:00:00.000Z
// end: 2025-10-20T23:59:59.999Z

// 월 범위
const { start, end } = getUTCMonthRange(new Date('2025-10-20'))
// start: 2025-10-01T00:00:00.000Z
// end: 2025-10-31T23:59:59.999Z
```

### 5. UTC 날짜 조작

```typescript
import { addUTCDays, addUTCMonths, isSameUTCDay } from '@/lib/utils'

const today = new Date()
const tomorrow = addUTCDays(today, 1)
const nextMonth = addUTCMonths(today, 1)

// 같은 날인지 UTC 기준으로 확인
if (isSameUTCDay(date1, date2)) {
  console.log('Same day!')
}
```

### 6. Validation

```typescript
import { isValidDateRangeUTC, isFutureDateUTC, isISODateString } from '@/lib/utils'

// 날짜 범위 검증
if (!isValidDateRangeUTC(startDate, endDate)) {
  throw new Error('Invalid date range')
}

// 미래 날짜 검증 (서버 시간 기준)
const serverTime = await getServerTime()
if (isFutureDateUTC(targetDate, serverTime)) {
  console.log('Future date')
}

// ISO 형식 검증
if (isISODateString(dateString)) {
  // Valid ISO 8601 format
}
```

## 컴포넌트 패턴

### 라운드 생성/수정 폼

```typescript
import { toDatetimeLocalString, fromDatetimeLocalString, formatDateRangeUTC } from '@/lib/utils'

function RoundForm({ round }: { round?: Round }) {
  const [formData, setFormData] = useState({
    startDate: toDatetimeLocalString(round?.startDate),
    endDate: toDatetimeLocalString(round?.endDate),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch('/api/rounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: formData.startDate
          ? fromDatetimeLocalString(formData.startDate)
          : null,
        endDate: formData.endDate
          ? fromDatetimeLocalString(formData.endDate)
          : null,
      }),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="datetime-local"
        value={formData.startDate}
        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
      />
      {/* 화면 표시는 UTC 기준 */}
      <p>{formatDateRangeUTC(round?.startDate, round?.endDate)}</p>
    </form>
  )
}
```

### 서버 시간 기반 필터링

```typescript
import { getServerTime, getUTCDayRange } from '@/lib/utils'

function CalendarSection() {
  const [serverTime, setServerTime] = useState<Date | null>(null)

  useEffect(() => {
    getServerTime().then(setServerTime)
  }, [])

  useEffect(() => {
    if (!serverTime) return

    // 서버 시간 기준으로 오늘 날짜
    const { start, end } = getUTCDayRange(serverTime)

    // 날짜 범위로 필터링
    const filteredRounds = rounds.filter(round => {
      const roundDate = new Date(round.startDate)
      return roundDate >= start && roundDate <= end
    })
  }, [serverTime, rounds])
}
```

## API 처리

### 서버 측 (이미 UTC로 처리됨)

Prisma는 자동으로 UTC로 저장/조회하므로 추가 변환 불필요:

```typescript
// ✅ 이미 UTC로 처리됨
const round = await prisma.round.create({
  data: {
    startDate: new Date(body.startDate), // ISO string -> UTC Date
    endDate: new Date(body.endDate),
  },
})
```

### 클라이언트 측

```typescript
// ✅ ISO string으로 전송
const response = await fetch('/api/rounds', {
  method: 'POST',
  body: JSON.stringify({
    startDate: '2025-10-20T14:30:00.000Z', // UTC ISO string
  }),
})
```

## 마이그레이션 체크리스트

기존 코드를 UTC 기반으로 변환할 때:

### datetime-local Input

```diff
- // ❌ 이전 (타임존 변환 문제)
- value={round?.startDate ? new Date(round.startDate).toISOString().slice(0, 16) : ''}

+ // ✅ 변경 후
+ value={toDatetimeLocalString(round?.startDate)}
```

### API 전송

```diff
- // ❌ 이전 (datetime-local 값 그대로 전송)
  body: JSON.stringify({
-   startDate: formData.startDate || null,
  })

+ // ✅ 변경 후
  body: JSON.stringify({
+   startDate: formData.startDate ? fromDatetimeLocalString(formData.startDate) : null,
  })
```

### 화면 표시

```diff
- // ❌ 이전 (로컬 타임존 영향)
- {formatDateRange(round.startDate, round.endDate)}

+ // ✅ 변경 후 (UTC 기준)
+ {formatDateRangeUTC(round.startDate, round.endDate)}
```

### 날짜 비교

```diff
- // ❌ 이전 (로컬 타임존 영향)
- const now = new Date()
- const start = new Date(round.startDate)
- const isWithinWindow = now >= start

+ // ✅ 변경 후
+ const serverTime = await getServerTime()
+ const start = new Date(round.startDate)
+ const isWithinWindow = serverTime >= start
```

## 테스트 가이드

### 날짜 표시 테스트

```typescript
// UTC 기준으로 정확히 표시되는지 확인
const utcDate = '2025-10-20T05:00:00.000Z'
expect(formatDateUTC(utcDate)).toBe('2025년 10월 20일 05:00')
```

### datetime-local 변환 테스트

```typescript
// 왕복 변환 테스트
const originalISO = '2025-10-20T14:30:00.000Z'
const datetimeLocal = toDatetimeLocalString(originalISO)
const backToISO = fromDatetimeLocalString(datetimeLocal)
expect(backToISO).toBe(originalISO)
```

## 주의사항

### 유지해야 할 로컬 시간 사용

다음 경우는 로컬 시간 사용이 적절합니다:

- 저작권 연도 표시: `new Date().getFullYear()`
- UI 인터랙션 타이밍: `Date.now()` 차이 계산
- 성능 측정: `performance.now()`

### 타임존 표시 옵션

사용자에게 날짜를 표시할 때 선택 가능:

```typescript
// 옵션 1: UTC 명시
export function formatDateWithTimezone(date: Date): string {
  return `${formatDateUTC(date)} (UTC)`
}

// 옵션 2: 사용자 타임존으로 변환 표시
export function formatDateLocal(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}
```

## 참고 자료

- [MDN - Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN - Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)
- [UTC vs Local Time](https://www.timeanddate.com/time/aboututc.html)
