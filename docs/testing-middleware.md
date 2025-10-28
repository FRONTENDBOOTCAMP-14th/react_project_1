# 미들웨어 인증 테스트 가이드

이 문서는 Next.js 미들웨어 인증 시스템을 테스트하는 방법을 설명합니다.

## 테스트 환경 설정

### 1. 환경 변수 확인

`.env` 파일에 필수 환경 변수가 모두 설정되어 있는지 확인합니다:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret-key-minimum-32-characters-long
KAKAO_CLIENT_ID=your-test-kakao-id
KAKAO_CLIENT_SECRET=your-test-kakao-secret
DATABASE_URL=your-database-url
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

## 수동 테스트 시나리오

### 시나리오 1: 공개 라우트 접근

**목적**: 인증 없이 공개 라우트에 접근 가능한지 확인

1. 브라우저에서 `http://localhost:3000/` 접속
2. **기대 결과**: 정상적으로 홈 페이지 표시

### 시나리오 2: 보호된 라우트 접근 (미인증)

**목적**: 인증되지 않은 사용자가 보호된 라우트 접근 시 리다이렉트

1. 로그아웃 상태 확인
2. `http://localhost:3000/community` 접속 시도
3. **기대 결과**: `/login?callbackUrl=/community`로 리다이렉트

### 시나리오 3: 로그인 후 보호된 라우트 접근

**목적**: 인증된 사용자는 보호된 라우트 접근 가능

1. `/login` 페이지에서 카카오 로그인
2. 로그인 성공 후 `/community` 접속
3. **기대 결과**: 커뮤니티 페이지 정상 표시

### 시나리오 4: API 엔드포인트 인증 (미인증)

**목적**: 인증되지 않은 사용자의 보호된 API 접근 차단

```bash
# cURL로 테스트
curl -X GET http://localhost:3000/api/communities
```

**기대 결과**:

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "인증이 필요합니다."
}
```

**HTTP 상태 코드**: 401

### 시나리오 5: API 엔드포인트 인증 (인증됨)

**목적**: 인증된 사용자의 API 접근 허용

1. 브라우저에서 로그인
2. 개발자 도구 → Network 탭 열기
3. 브라우저에서 `/api/communities` 요청 확인
4. **기대 결과**: 200 OK, 커뮤니티 목록 반환

### 시나리오 6: 권한 확인

**목적**: 역할 기반 접근 제어 동작 확인

1. 멤버 계정으로 로그인
2. 팀장 권한이 필요한 API 호출 시도
   - 예: 커뮤니티 삭제 `DELETE /api/communities/[id]`
3. **기대 결과**: 403 Forbidden

```json
{
  "success": false,
  "error": "팀장만 접근 가능합니다."
}
```

### 시나리오 7: 로그인된 사용자가 로그인 페이지 접근

**목적**: 로그인된 사용자의 로그인 페이지 리다이렉트

1. 로그인 상태 확인
2. `/login` 페이지 접속 시도
3. **기대 결과**: 홈 페이지(`/`)로 리다이렉트

## 자동 테스트 (선택 사항)

### Playwright를 사용한 E2E 테스트 예제

```typescript
// tests/middleware-auth.spec.ts
import { test, expect } from '@playwright/test'

test('unauthenticated user redirected to login', async ({ page }) => {
  await page.goto('/community')
  await expect(page).toHaveURL(/.*login.*/)
})

test('authenticated user can access protected route', async ({ page, context }) => {
  // 세션 쿠키 설정 (로그인 시뮬레이션)
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'your-test-token',
      domain: 'localhost',
      path: '/',
    },
  ])

  await page.goto('/community')
  await expect(page).not.toHaveURL(/.*login.*/)
})

test('API returns 401 for unauthenticated requests', async ({ request }) => {
  const response = await request.get('/api/communities')
  expect(response.status()).toBe(401)
  const body = await response.json()
  expect(body.success).toBe(false)
  expect(body.error).toBe('Unauthorized')
})
```

## 성능 테스트

### 미들웨어 응답 시간 확인

```bash
# Apache Bench 사용
ab -n 100 -c 10 http://localhost:3000/api/health

# 또는 curl로 간단히 측정
time curl http://localhost:3000/api/communities
```

**기대 결과**: 미들웨어 처리 시간 < 50ms

## 보안 테스트

### 1. JWT 토큰 검증

```bash
# 유효하지 않은 토큰으로 API 요청
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:3000/api/communities
```

**기대 결과**: 401 Unauthorized

### 2. CSRF 방지 확인

NextAuth는 기본적으로 CSRF 토큰을 사용합니다. POST 요청 시 자동으로 검증됩니다.

### 3. SQL Injection 방지

Prisma ORM이 자동으로 매개변수화된 쿼리를 사용하므로 기본적으로 보호됩니다.

## 디버깅

### 미들웨어 로그 확인

미들웨어에서 디버그 로그를 추가하려면:

```typescript
// middleware.ts
export default withAuth(
  req => {
    console.log('[Middleware] Path:', req.nextUrl.pathname)
    console.log('[Middleware] Token:', !!req.nextauth.token)
    // ... 나머지 코드
  }
  // ...
)
```

### NextAuth 디버깅

`.env`에 디버그 모드 활성화:

```bash
NEXTAUTH_DEBUG=true
```

개발 서버 재시작 후 콘솔에서 자세한 로그 확인 가능합니다.

## 체크리스트

테스트 완료 후 다음 항목들을 확인하세요:

- [ ] 공개 라우트 접근 가능
- [ ] 보호된 라우트 미인증 시 리다이렉트
- [ ] 보호된 API 미인증 시 401 응답
- [ ] 로그인 후 보호된 라우트 접근 가능
- [ ] 로그인 후 보호된 API 호출 가능
- [ ] 권한 부족 시 403 응답
- [ ] 로그인된 사용자 로그인 페이지 리다이렉트
- [ ] 정적 파일 접근 가능
- [ ] 미들웨어 성능 양호 (< 50ms)
- [ ] 환경 변수 모두 설정됨

## 트러블슈팅

### 미들웨어가 실행되지 않음

- `middleware.ts` 파일이 프로젝트 루트에 있는지 확인
- 파일명이 정확한지 확인 (middleware.ts, middleware.js만 유효)
- 개발 서버 재시작

### 무한 리다이렉트

- `isPublicRoute` 함수에 `/login` 경로가 포함되어 있는지 확인
- NextAuth 설정의 `pages.signIn` 값이 올바른지 확인

### 401 에러가 계속 발생

- 브라우저 쿠키 확인
- `NEXTAUTH_SECRET` 환경 변수 설정 확인
- 로그인 세션이 유효한지 확인 (만료되지 않았는지)

## 참고 자료

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [NextAuth.js Testing](https://next-auth.js.org/getting-started/client#testing)
- [Playwright Testing](https://playwright.dev/)

---

문서 작성일: 2025-01-27  
최종 수정일: 2025-01-27
