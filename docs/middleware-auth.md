# Next.js 미들웨어를 활용한 인증 시스템

이 문서는 Next.js 미들웨어와 NextAuth를 통합하여 구현한 인증 시스템에 대한 설명입니다.

## 📋 목차

1. [개요](#개요)
2. [아키텍처](#아키텍처)
3. [주요 기능](#주요-기능)
4. [사용 방법](#사용-방법)
5. [API 라우트 예제](#api-라우트-예제)
6. [성능 최적화](#성능-최적화)
7. [보안 고려사항](#보안-고려사항)

## 개요

### 목적

- **일관된 인증 처리**: 모든 보호된 라우트에 대해 서버 측에서 일관되게 인증 확인
- **성능 향상**: 불필요한 페이지 로드 및 API 호출 방지
- **보안 강화**: 클라이언트 측 인증 우회 방지
- **개발 생산성**: 각 라우트에서 인증 코드 반복 제거

### 기술 스택

- **Next.js 15**: App Router 및 미들웨어
- **NextAuth v4**: JWT 기반 세션 관리
- **Prisma**: 데이터베이스 ORM
- **TypeScript**: 타입 안정성

## 아키텍처

### 전체 흐름

```
1. 사용자 요청
   ↓
2. Next.js 미들웨어 (middleware.ts)
   - 경로 확인 (공개/보호)
   - JWT 토큰 검증
   ↓
3-a. 인증 실패 → 로그인 페이지 리다이렉트 또는 401 응답
3-b. 인증 성공 → 요청 계속 진행
   ↓
4. API 라우트 또는 페이지 컴포넌트
   - 세션에서 userId 추출
   - 필요시 권한 확인
   ↓
5. 응답 반환
```

### 파일 구조

```
.
├── middleware.ts                    # 글로벌 미들웨어
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               ├── auth-options.ts  # NextAuth 설정
│               └── route.ts         # NextAuth 핸들러
├── lib/
│   ├── auth/
│   │   ├── index.ts                 # 인증 함수 export
│   │   └── permissions.ts           # 권한 확인 유틸
│   ├── middleware/
│   │   └── auth.ts                  # API 인증 미들웨어
│   ├── types/
│   │   └── middleware.ts            # 미들웨어 타입
│   └── utils/
│       └── api-auth.ts              # 간편 인증 헬퍼
└── .env.example                     # 환경 변수 예제
```

## 주요 기능

### 1. 자동 라우트 보호

미들웨어가 자동으로 보호된 라우트를 확인하고 인증을 요구합니다.

**보호된 라우트:**

- `/community/*` - 커뮤니티 페이지
- `/goal/*` - 목표 관리 페이지
- `/profile/*` - 프로필 페이지
- `/api/communities/*` - 커뮤니티 API
- `/api/goals/*` - 목표 API
- 기타 보호된 API 엔드포인트

**공개 라우트:**

- `/` - 홈 페이지
- `/login` - 로그인 페이지
- `/api/auth/*` - 인증 API
- `/api/health` - 헬스 체크
- 정적 파일 및 이미지

### 2. JWT 토큰 기반 인증

NextAuth의 JWT 전략을 사용하여 빠르고 효율적인 인증을 제공합니다.

**장점:**

- 데이터베이스 조회 없이 토큰만으로 인증 확인
- 서버리스 환경에 최적화
- 확장성 우수

### 3. 역할 기반 접근 제어 (RBAC)

커뮤니티 내 사용자 역할에 따른 세밀한 권한 관리를 제공합니다.

**역할 계층:**

- `admin` (팀장/관리자): 멤버 관리 및 콘텐츠 수정/삭제 등 모든 관리 권한
- `member` (멤버): 기본 읽기 및 참여

### 4. 성능 최적화

- **조기 차단**: 미들웨어에서 인증되지 않은 요청을 즉시 차단
- **캐싱**: 세션 정보 캐싱으로 중복 조회 방지
- **최소 쿼리**: 필요한 경우에만 데이터베이스 조회

## 사용 방법

### 페이지 컴포넌트에서 세션 사용

미들웨어가 이미 인증을 확인했으므로, 페이지에서는 단순히 세션을 가져오기만 하면 됩니다.

```typescript
// app/community/[id]/page.tsx
import { getSession } from '@/lib/auth'

export default async function CommunityPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  // 미들웨어가 이미 인증을 확인했으므로 session은 항상 존재
  const userId = session?.userId

  // 페이지 로직...
  return <div>Welcome, {userId}</div>
}
```

### API 라우트에서 인증 확인

#### 방법 1: 간편 헬퍼 사용 (권장)

```typescript
// app/api/communities/route.ts
import { requireAuthUser } from '@/lib/utils/api-auth'
import { createSuccessResponse } from '@/lib/utils/response'

export async function POST(req: Request) {
  // 인증 확인
  const { userId, error } = await requireAuthUser()
  if (error) return error

  const body = await req.json()

  // 비즈니스 로직...
  return createSuccessResponse({ userId, data: body }, 201)
}
```

#### 방법 2: 권한 확인 포함

```typescript
// app/api/communities/[id]/route.ts
import { requireAuthAndAccess } from '@/lib/utils/api-auth'
import { createSuccessResponse } from '@/lib/utils/response'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  // 인증 + 팀장 권한 확인
  const { userId, role, error } = await requireAuthAndAccess(params.id, 'admin')
  if (error) return error

  // 삭제 로직...
  return createSuccessResponse({ message: '삭제되었습니다.' })
}
```

#### 방법 3: 기존 미들웨어 함수 사용

```typescript
// app/api/goals/route.ts
import { requireAuth } from '@/lib/middleware/auth'

export async function GET() {
  const { error, userId } = await requireAuth()
  if (error) return error

  // 목표 조회 로직...
  return NextResponse.json({ userId })
}
```

### 권한 확인

```typescript
import { hasPermission } from '@/lib/auth'

// 사용자가 커뮤니티의 관리자 이상인지 확인
const isAdmin = await hasPermission(userId, clubId, 'admin')

if (!isAdmin) {
  return createErrorResponse('관리자 권한이 필요합니다.', 403)
}
```

## API 라우트 예제

### 예제 1: 커뮤니티 생성 (인증만 필요)

```typescript
// app/api/communities/route.ts
import { requireAuthUser } from '@/lib/utils/api-auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  // 1. 인증 확인
  const { userId, error: authError } = await requireAuthUser()
  if (authError) return authError

  // 2. 요청 바디 파싱
  const body = await req.json()
  const { name, description, isPublic } = body

  // 3. 유효성 검증
  if (!name?.trim()) {
    return createErrorResponse('커뮤니티 이름은 필수입니다.', 400)
  }

  // 4. 커뮤니티 생성
  const community = await prisma.community.create({
    data: { name, description, isPublic },
  })

  return createSuccessResponse(community, 201)
}
```

### 예제 2: 커뮤니티 수정 (관리자 권한 필요)

```typescript
// app/api/communities/[id]/route.ts
import { requireAuthAndAccess } from '@/lib/utils/api-auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import prisma from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // 1. 인증 + 관리자 권한 확인
  const { userId, error } = await requireAuthAndAccess(params.id, 'admin')
  if (error) return error

  // 2. 요청 바디 파싱
  const body = await req.json()
  const { name, description } = body

  // 3. 커뮤니티 업데이트
  const updated = await prisma.community.update({
    where: { clubId: params.id },
    data: { name, description, updatedAt: new Date() },
  })

  return createSuccessResponse(updated)
}
```

### 예제 3: 복잡한 권한 확인

```typescript
// app/api/rounds/[id]/route.ts
import { requireAuthUser } from '@/lib/utils/api-auth'
import { hasPermission } from '@/lib/auth'
import { createErrorResponse } from '@/lib/utils/response'
import prisma from '@/lib/prisma'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  // 1. 인증 확인
  const { userId, error: authError } = await requireAuthUser()
  if (authError) return authError

  // 2. 라운드 정보 조회
  const round = await prisma.round.findUnique({
    where: { roundId: params.id },
    select: { clubId: true },
  })

  if (!round) {
    return createErrorResponse('라운드를 찾을 수 없습니다.', 404)
  }

  // 3. 팀장 권한 확인
  const isLeader = await hasPermission(userId!, round.clubId, 'admin')
  if (!isLeader) {
    return createErrorResponse('팀장만 라운드를 삭제할 수 있습니다.', 403)
  }

  // 4. 소프트 삭제
  await prisma.round.update({
    where: { roundId: params.id },
    data: { deletedAt: new Date() },
  })

  return createSuccessResponse({ message: '라운드가 삭제되었습니다.' })
}
```

## 성능 최적화

### 1. 조기 차단 (Early Return)

미들웨어에서 인증되지 않은 요청을 즉시 차단하여 불필요한 처리를 방지합니다.

```typescript
// middleware.ts에서 자동 처리
if (isProtectedRoute(pathname) && !token) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 2. 쿼리 최적화

필요한 필드만 선택하여 데이터베이스 부하를 줄입니다.

```typescript
// 권한 확인 시 최소 필드만 조회
const membership = await prisma.communityMember.findFirst({
  where: { userId, clubId, deletedAt: null },
  select: { id: true, role: true }, // 필요한 필드만
})
```

### 3. 병렬 처리

독립적인 작업은 병렬로 실행합니다.

```typescript
// 병렬로 여러 권한 확인
const [isMember, isAdmin] = await Promise.all([
  hasPermission(userId, clubId, 'member'),
  hasPermission(userId, clubId, 'admin'),
])
```

## 보안 고려사항

### 1. JWT 토큰 보안

- `NEXTAUTH_SECRET` 환경 변수를 반드시 설정
- 프로덕션에서는 강력한 시크릿 키 사용
- 토큰 만료 시간 적절히 설정

```bash
# .env
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
```

### 2. HTTPS 사용

프로덕션 환경에서는 반드시 HTTPS를 사용하여 토큰 탈취를 방지합니다.

```bash
# .env
NEXTAUTH_URL=https://yourdomain.com
```

### 3. 입력 검증

모든 사용자 입력을 검증하여 SQL 인젝션 등의 공격을 방지합니다.

```typescript
// 입력 검증 예제
const clubId = body?.clubId?.trim()
if (!clubId || typeof clubId !== 'string') {
  return createErrorResponse('Invalid clubId', 400)
}
```

### 4. 권한 체크 우회 방지

클라이언트 측 권한 확인에만 의존하지 않고, 서버 측에서 반드시 재확인합니다.

```typescript
// ❌ 클라이언트만 체크 (위험)
if (isAdmin) {
  await deleteResource()
}

// ✅ 서버에서 재확인 (안전)
const isAdmin = await hasPermission(userId, clubId, 'admin')
if (!isAdmin) {
  return createErrorResponse('Forbidden', 403)
}
await deleteResource()
```

## 환경 변수

### 필수 환경 변수

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-at-least-32-characters

# 카카오 로그인
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DIRECT_URL=postgresql://user:password@localhost:5432/dbname

# 리다이렉트 URL
LOGIN_SUCCESS_REDIRECT=/
REGISTER_PAGE_URL=/login?step=register
```

## 트러블슈팅

### 미들웨어가 동작하지 않음

1. `middleware.ts` 파일이 프로젝트 루트에 있는지 확인
2. `config.matcher` 설정이 올바른지 확인
3. `next-auth` 패키지가 설치되어 있는지 확인

### 401 Unauthorized 에러

1. `NEXTAUTH_SECRET`이 설정되어 있는지 확인
2. 로그인 상태가 유효한지 확인
3. 브라우저 쿠키가 활성화되어 있는지 확인

### 권한 확인이 작동하지 않음

1. 사용자가 해당 커뮤니티의 멤버인지 확인
2. 역할(role)이 올바르게 설정되어 있는지 확인
3. 데이터베이스 쿼리가 `deletedAt: null` 조건을 포함하는지 확인

## 참고 자료

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/middleware)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth Middleware Configuration](https://next-auth.js.org/configuration/nextjs#middleware)

## 마이그레이션 가이드

기존 API 라우트를 새로운 인증 시스템으로 마이그레이션하는 방법:

### Before (기존 코드)

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = session?.userId

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 로직...
}
```

### After (개선된 코드)

```typescript
import { requireAuthUser } from '@/lib/utils/api-auth'

export async function GET() {
  const { userId, error } = await requireAuthUser()
  if (error) return error

  // 로직...
}
```

**장점:**

- 코드가 더 간결하고 읽기 쉬움
- 에러 처리가 일관됨
- 미들웨어와 통합되어 성능 향상

---

문서 작성일: 2025-01-27  
최종 수정일: 2025-01-27  
버전: 1.0.0
