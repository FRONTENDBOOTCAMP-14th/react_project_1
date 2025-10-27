# API 라우트 마이그레이션 예제

기존 인증 코드를 미들웨어 기반 인증으로 개선하는 실제 예제입니다.

## 예제 1: 간단한 인증 확인

### Before (기존 코드)

```typescript
// app/api/profile/delete/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import prisma from '@/lib/prisma'
import { getErrorMessage } from '@/lib/errors'
import type { CustomSession } from '@/lib/types'

export async function POST() {
  const session = await getServerSession(authOptions)
  const userId = (session as CustomSession)?.userId
  
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'unauthorized' },
      { status: 401 }
    )
  }

  try {
    await prisma.user.update({
      where: { userId },
      data: { deletedAt: new Date() },
    })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: 'delete_failed',
        detail: getErrorMessage(e, 'Unknown error'),
      },
      { status: 500 }
    )
  }
}
```

### After (개선된 코드)

```typescript
// app/api/profile/delete/route.ts
import { requireAuthUser } from '@/lib/utils/api-auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import prisma from '@/lib/prisma'
import { getErrorMessage } from '@/lib/errors'

export async function POST() {
  // 미들웨어가 이미 인증을 확인, 간단한 헬퍼로 userId 획득
  const { userId, error } = await requireAuthUser()
  if (error) return error

  try {
    await prisma.user.update({
      where: { userId },
      data: { deletedAt: new Date() },
    })
    return createSuccessResponse({ message: '계정이 삭제되었습니다.' })
  } catch (e: unknown) {
    return createErrorResponse(
      getErrorMessage(e, '계정 삭제에 실패했습니다.'),
      500
    )
  }
}
```

### 개선 사항

✅ **코드 간소화**: 12줄 → 5줄 (인증 부분)  
✅ **일관성**: 표준화된 응답 형식 사용  
✅ **가독성**: 더 명확한 의도 표현  
✅ **성능**: 미들웨어에서 이미 인증 확인

---

## 예제 2: 권한 확인 포함

### Before (기존 코드)

```typescript
// app/api/communities/[id]/route.ts (가상 예제)
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import prisma from '@/lib/prisma'
import type { CustomSession } from '@/lib/types'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // 1. 인증 확인
  const session = await getServerSession(authOptions)
  const userId = (session as CustomSession)?.userId

  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 2. 멤버십 확인
  const membership = await prisma.communityMember.findFirst({
    where: {
      userId,
      clubId: params.id,
      deletedAt: null,
    },
  })

  if (!membership) {
    return NextResponse.json(
      { success: false, error: 'Not a member' },
      { status: 403 }
    )
  }

  // 3. 팀장 권한 확인
  if (membership.role !== 'owner') {
    return NextResponse.json(
      { success: false, error: 'Only owner can delete' },
      { status: 403 }
    )
  }

  // 4. 삭제 실행
  try {
    await prisma.community.update({
      where: { clubId: params.id },
      data: { deletedAt: new Date() },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Delete failed' },
      { status: 500 }
    )
  }
}
```

### After (개선된 코드)

```typescript
// app/api/communities/[id]/route.ts
import { requireAuthAndAccess } from '@/lib/utils/api-auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // 인증 + 팀장 권한 확인을 한 번에 처리
  const { userId, error } = await requireAuthAndAccess(params.id, 'owner')
  if (error) return error

  // 삭제 실행
  try {
    await prisma.community.update({
      where: { clubId: params.id },
      data: { deletedAt: new Date() },
    })
    return createSuccessResponse({ message: '커뮤니티가 삭제되었습니다.' })
  } catch (err) {
    return createErrorResponse('커뮤니티 삭제에 실패했습니다.', 500)
  }
}
```

### 개선 사항

✅ **코드 간소화**: 45줄 → 20줄  
✅ **에러 처리 일관성**: 모든 에러가 표준 형식  
✅ **재사용성**: 권한 확인 로직 재사용  
✅ **유지보수성**: 비즈니스 로직에 집중

---

## 예제 3: 복잡한 조건부 권한 확인

### Before (기존 코드)

```typescript
// app/api/rounds/[id]/route.ts (가상 예제)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  // 1. 인증
  const session = await getServerSession(authOptions)
  const userId = (session as CustomSession)?.userId
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. 라운드 조회
  const round = await prisma.round.findUnique({
    where: { roundId: params.id },
    include: {
      community: {
        include: {
          communityMembers: {
            where: { userId, deletedAt: null },
          },
        },
      },
    },
  })

  if (!round) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // 3. 권한 확인 (팀장 또는 관리자)
  const member = round.community.communityMembers[0]
  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 4. 업데이트
  const body = await req.json()
  const updated = await prisma.round.update({
    where: { roundId: params.id },
    data: body,
  })

  return NextResponse.json({ success: true, data: updated })
}
```

### After (개선된 코드)

```typescript
// app/api/rounds/[id]/route.ts
import { requireAuthUser } from '@/lib/utils/api-auth'
import { hasPermission } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  // 1. 인증
  const { userId, error: authError } = await requireAuthUser()
  if (authError) return authError

  // 2. 라운드 조회
  const round = await prisma.round.findUnique({
    where: { roundId: params.id },
    select: { roundId: true, clubId: true },
  })

  if (!round) {
    return createErrorResponse('라운드를 찾을 수 없습니다.', 404)
  }

  // 3. 권한 확인 (관리자 이상)
  const hasAccess = await hasPermission(userId!, round.clubId, 'admin')
  if (!hasAccess) {
    return createErrorResponse('관리자 권한이 필요합니다.', 403)
  }

  // 4. 업데이트
  const body = await req.json()
  const updated = await prisma.round.update({
    where: { roundId: params.id },
    data: body,
  })

  return createSuccessResponse(updated)
}
```

### 개선 사항

✅ **쿼리 최적화**: 필요한 필드만 조회 (select 사용)  
✅ **명확한 권한 체크**: `hasPermission` 헬퍼로 가독성 향상  
✅ **일관된 응답**: 모든 응답이 표준 형식  
✅ **타입 안정성**: TypeScript 타입 추론 개선

---

## 마이그레이션 체크리스트

기존 API를 개선할 때 다음 항목들을 확인하세요:

### 1. 인증 코드 교체

- [ ] `getServerSession` + 타입 캐스팅 → `requireAuthUser()` 또는 `getCurrentUserId()`
- [ ] 수동 401 에러 처리 제거 (헬퍼가 자동 처리)

### 2. 권한 확인 개선

- [ ] 반복적인 멤버십 쿼리 → `hasPermission()` 또는 `requireCommunityAccess()`
- [ ] 역할 비교 로직 → 역할 계층 구조 활용

### 3. 응답 형식 통일

- [ ] `NextResponse.json()` → `createSuccessResponse()` / `createErrorResponse()`
- [ ] 에러 메시지 일관성 확인

### 4. 쿼리 최적화

- [ ] 불필요한 `include` 제거
- [ ] 필요한 필드만 `select`
- [ ] N+1 쿼리 방지

### 5. 코드 정리

- [ ] 불필요한 import 제거
- [ ] 주석 업데이트
- [ ] lint 에러 수정

---

## 단계별 마이그레이션 가이드

### Step 1: 미들웨어 설정 확인

```bash
# middleware.ts 파일이 루트에 있는지 확인
ls -la middleware.ts
```

### Step 2: 한 API 라우트씩 개선

가장 간단한 API부터 시작하여 점진적으로 개선합니다.

```typescript
// 1. 단순 인증만 필요한 API
//    예: GET /api/user/communities

// 2. 권한 확인이 필요한 API
//    예: POST /api/communities

// 3. 복잡한 권한 로직이 있는 API
//    예: DELETE /api/communities/[id]
```

### Step 3: 테스트

각 API를 개선한 후 반드시 테스트합니다:

```bash
# 수동 테스트
curl -X GET http://localhost:3000/api/your-endpoint

# 또는 브라우저 개발자 도구에서 Network 탭 확인
```

### Step 4: 커밋

작은 단위로 자주 커밋합니다:

```bash
git add .
git commit -m "refactor: improve auth for /api/communities"
```

---

## 주의사항

### ⚠️ 호환성

- 미들웨어는 Edge Runtime에서 실행됨
- Prisma는 미들웨어에서 직접 사용 불가 (API 라우트에서만)
- 파일 시스템 접근 불가

### ⚠️ 성능

- 미들웨어는 모든 요청에 실행되므로 최대한 가볍게 유지
- 무거운 로직은 API 라우트로 이동

### ⚠️ 보안

- 클라이언트 측 권한 확인에만 의존하지 말 것
- 서버 측에서 항상 권한 재확인

---

## 다음 단계

1. **기존 API 라우트 점진적 개선**
2. **테스트 코드 작성** (E2E, 통합 테스트)
3. **모니터링 설정** (에러 로깅, 성능 측정)
4. **문서화** (API 명세, 권한 매트릭스)

---

문서 작성일: 2025-01-27  
최종 수정일: 2025-01-27
