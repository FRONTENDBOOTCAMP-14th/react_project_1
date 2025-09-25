# Study Club Tracker – Coding Conventions

본 문서는 본 프로젝트의 코딩/네이밍/브랜치/커밋/PR 규칙을 정의합니다.

---

## 컨벤션 요약표

| 주제     | 핵심 규칙                                                                   |
| -------- | --------------------------------------------------------------------------- |
| 디렉터리 | `app/`는 App Router 기준, 컴포넌트는 `components/`에 colocation             |
| 네이밍   | 컴포넌트 `PascalCase`, 유틸 `camelCase`, 상수 `UPPER_SNAKE_CASE`            |
| 스타일   | 전역은 `app/globals.css`, 로컬은 `*.module.css`, 토큰은 `styles/tokens.css` |
| 폰트     | `next/font/local`로 `app/fonts/` 관리, `app/layout.tsx`에서 불러오기        |
| API      | 응답은 `{ success, data?, error? }` 패턴, 상태코드 표준 준수                |
| Git      | Conventional Commits, `feature/<topic>` 브랜치, 작은 단위 PR                |

---

## 1. 기본 원칙

- **가독성 우선**: 짧고 명확한 함수/변수명. 주석은 "왜"를 설명.
- **일관성**: 파일 구조, 네이밍, import 경로, 코드 스타일(ESLint/Prettier) 일관 유지.
- **캡슐화**: 컴포넌트와 스타일, 유틸은 가능한 **colocation**.
- **작은 단위 커밋**: 의미 있는 최소 단위로 커밋하고, PR은 작게 유지.

---

## 2. 디렉터리와 파일 구조

- **페이지/라우트**: `app/**/page.tsx`, API는 `app/api/**/route.ts` (Next.js App Router)
- **컴포넌트**: `components/` 하위에 도메인/유형별 디렉터리(`common/`, `ui/`, `forms/` 등)로 구성
- **스타일**: 전역은 `app/globals.css`, 나머지 CSS Modules는 **컴포넌트/페이지와 같은 위치**에 둡니다
- **유틸**: `lib/` (예: `lib/utils.ts`, `lib/supabase/*`)
- **문서**: `docs/` (본 파일 포함)

---

## 3. 네이밍 컨벤션

- **파일/폴더**
  - 컴포넌트 파일: `PascalCase` (예: `GoalCard.tsx`)
  - 유틸/훅/라이브러리: `camelCase` (예: `useGoal.ts`, `formatDate.ts`)
  - 페이지 파일: Next 규칙(`page.tsx`, `layout.tsx`, `route.ts`)
  - 테스트 파일(추가 시): `*.test.ts(x)` 또는 `*.spec.ts(x)`
- **변수/함수**: `camelCase` (명확한 동사+명사 조합 권장)
- **타입/인터페이스**: `PascalCase` (예: `StudyGoal`, `TeamMember`)
- **상수**: `UPPER_SNAKE_CASE`
- **환경변수**: 공개 키는 `NEXT_PUBLIC_*`, 서버 전용은 접두사 없이(예: `SUPABASE_SERVICE_ROLE_KEY`)

---

## 4. CSS 규칙 (CSS Modules + 전역 최소화)

- **위치**: 각 컴포넌트/페이지 옆에 `*.module.css` (colocation)
- **클래스 네이밍**: 로컬 스코프이므로 **간결한 이름** 사용
  - 블록/요소/상태 느낌을 살린 단순 패턴 권장: `container`, `title`, `subtitle`, `actions`, `isActive` 등
  - 변형은 별도 클래스 조합: `<div className={`${styles.card} ${styles.danger}`}/>`
- **토큰/전역 유틸**: 전역 색/간격 등은 `styles/tokens.css`에 CSS 변수로 정의하고, 필요한 항목만 `app/globals.css`에서 import
  - 네이밍 규칙: `--color-<name>`, `--space-<step>`, `--font-<usage>` 등 기능 중심으로 구성
  - 예:

    ```css
    :root {
      --color-primary: #0ea5e9;
      --space-4: 1rem;
      --font-body: var(--pretendard);
    }
    ```

- **미디어쿼리/반응형**: 필요 시 컴포넌트 모듈 내부에서 최소한으로 처리
- **서드파티**: 전역 프레임워크(PureCSS)는 `app/layout.tsx`에서 import (이미 적용)

> 토큰 파일 변경 시 릴리즈 노트에 주요 변경 사항을 남겨 디자인/개발 간 싱크를 맞춥니다.

예시

```css
/* Button.module.css */
.button {
  /* 기본 스타일 */
}
.secondary {
  /* 변형 */
}
.isLoading {
  /* 상태 */
}
```

---

## 5. React/Next.js 규칙

- **서버 컴포넌트 우선**: 기본은 서버 컴포넌트. 브라우저 상호작용이 필요할 때만 상단에 `"use client"` 추가.
- **상태/이펙트 최소화**: 클라이언트 컴포넌트는 꼭 필요한 곳에만.
- **데이터 패칭**: 가능한 서버에서(서버 컴포넌트/Route Handler/Server Action) 수행하고 props로 전달.
- **폰트 관리**: `app/fonts/index.ts`에서 `next/font/local`을 사용해 폰트를 정의하고, 레이아웃에서 `className` 또는 CSS 변수로 적용.
  - 필요한 경우 `fonts.pretendard.className`을 레이아웃 루트에 연결하고, 모듈 CSS에서는 `var(--pretendard)`를 사용합니다.
- **라우팅**: 라우트 그룹 사용 시 `(marketing)`, `(app)` 등으로 **레이아웃 분리**하되 URL에는 반영되지 않음.
- **Route Segment Config**: 점진적 정적 생성(`revalidate`), 동적 렌더링(`dynamic`) 등 설정값은 각 세그먼트의 `page.tsx` 또는 `route.ts`에서 명시적으로 선언합니다.
- **import 경로**: `tsconfig.json`의 `paths`를 이용하여 `@/components/*`, `@/lib/*`, `@/app/*` 절대 경로 사용.

---

## 6. TypeScript

- **엄격 모드 유지** (`strict: true`)
- **명시적 타입**: 공개 API/유틸은 반환 타입 명시 권장
- **유니온/제네릭**: 과도한 복잡화 지양, 필요한 만큼만 사용
- **타입 체크 명령**: `pnpm typecheck`로 CI와 동일한 `tsc --noEmit` 검사를 수행
- **CI**: `lint-and-typecheck` 워크플로에서 `pnpm lint`, `pnpm typecheck` 자동 실행

---

## 7. API(Route Handler) 규칙

- **파일 위치**: `app/api/<resource>/route.ts`
- **HTTP 규칙**: 리소스/HTTP 메서드 일관성 유지 (예: `GET /api/goals`, `POST /api/goals`)
- **에러 처리**: `try/catch`로 캐치 후 `NextResponse.json({ success: false, error }, { status })`
- **보안**: 현재 단계에서 미들웨어 미적용. 운영 전 보안 계층(API Key/Basic/Supabase Auth) 추가 예정

### 7.1 응답 스키마

```ts
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string }
```

### 7.2 상태 코드 매핑

| 상황         | 상태 코드    | 응답 예시                                     |
| ------------ | ------------ | --------------------------------------------- |
| 정상 처리    | `200`, `201` | `{ success: true, data: {...} }`              |
| 유효성 오류  | `400`        | `{ success: false, error: 'BAD_REQUEST' }`    |
| 인증 실패    | `401`, `403` | `{ success: false, error: 'UNAUTHORIZED' }`   |
| 찾을 수 없음 | `404`        | `{ success: false, error: 'NOT_FOUND' }`      |
| 서버 오류    | `500`        | `{ success: false, error: 'INTERNAL_ERROR' }` |

예시

```ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: [] })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
```

---

## 8. Supabase 사용 규칙

- **클라이언트 분리**: 브라우저(`lib/supabase/client.ts`), 서버(`lib/supabase/server.ts`) 분리
- **환경변수**: URL/ANON 키는 `.env`에 설정. 서비스 롤 키 사용 시 절대 클라이언트 노출 금지
- **RLS**: 개발 단계에서는 완전 허용 정책으로 시작할 수 있으나, 운영 전 반드시 정책 확립
- **타입 생성(옵션)**: `supabase gen types`를 통해 `lib/database.types.ts` 생성 권장
- **환경 변수 템플릿**: `.env.example`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 정의. 서버 전용 키는 브라우저에 노출 금지

---

## 9. 커밋 메시지 (Conventional Commits)

- 형식: `<type>(scope)?: <subject>`
- type 예시: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`
- 예: `feat(auth): add email sign-in route`

가이드

- **커밋 메세지 + 이슈번호**
  - **feat(\<scope>):** 새로운 기능 추가 및 변경
  - **fix(\<scope>):** 버그 수정, 예외 처리 개선
  - **docs(\<scope>):** 문서 추가/수정 (코드 영향 없음)
  - **style(\<scope>):** UI 스타일 변경, 코드 포맷 조정 (로직 변경 없음)
  - **refactor(\<scope>):** 동작은 동일하지만 구조 개선
  - **test(\<scope>):** 테스트 코드 추가/보완/삭제
  - **ci(\<scope>):** 빌드·배포 파이프라인 및 린트 설정 수정
  - **chore(\<scope>):** 패키지 업데이트, 환경 설정 등 기타 작업

- **영문 소문자**, 명령형 현재 시제
- 본문 필요 시 한 줄 띄우고 상세 설명

## 10. 브랜치 전략

- 메인 라인: `develop` (또는 `main`)
- 기능 브랜치: `feature/<ticket|topic>`
- 초기화/스캐폴딩: `init/<topic>` (상위 동일명 브랜치 생성 금지 – `init` 단독 브랜치와 충돌 주의)
- 태스크: `task/<topic>`
- 긴급 수정: `hotfix/<desc>`
- 머지 전략: 기능 브랜치는 PR 후 `squash and merge` 기본, 다수 커밋 유지가 필요하면 `rebase and merge` 선택
- 리뷰 기준: 최소 1인 이상 승인, 셀프 머지 금지

예시

```text
feature/progress-endpoint
init/nextjs-setup
```

---

## 11. PR 규칙

- **작고 빈번하게**: 큰 덩어리는 분할
- **체크리스트**
  - [ ] 코드 변경 사항을 설명하는 커밋 메시지를 작성했습니다.
  - [ ] 코드 품질을 위한 자체 리뷰를 진행했습니다.
  - [ ] 관련 문서를 업데이트했습니다.
  - [ ] 빌드/타입 에러 없음
  - [ ] ESLint/Prettier 적용 (`pnpm lint`, `pnpm format`)

---

## 12. 코드 스타일 (ESLint/Prettier)

- 명령어
  - 린트: `pnpm lint`
  - 포맷: `pnpm format`
  - 타입 체크: `pnpm typecheck`
- 콘솔 사용: `eslint.config.mjs`에서 개발 모드는 `console.log` 허용(경고), 프로덕션 빌드에서는 `log` 금지하고 `warn`/`error`만 허용
- 미사용 변수: 경고(가급적 제거). 필요 시 `_` prefix로 무시
- Prettier: `.prettierrc` 기준 `semi: false`, `singleQuote: true`, `trailingComma: 'es5'`, `printWidth: 100`, `arrowParens: 'avoid'`
- ESLint 설정: `eslint.config.mjs`(Flat Config)에서 `next/core-web-vitals` + `prettier` 확장, `@typescript-eslint`, `react-hooks`, `import`, `prettier` 플러그인 사용

---

## 13. 예시 패턴

### 13.1 컴포넌트 + CSS Module

```tsx
// components/ui/Card.tsx
import styles from './Card.module.css'

type CardProps = { title: string; children?: React.ReactNode }
export default function Card({ title, children }: CardProps) {
  return (
    <section className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </section>
  )
}
```

```css
/* components/ui/Card.module.css */
.card {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.title {
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}
```

### 13.2 라우트 핸들러 응답 템플릿

```ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // validate body...
    return NextResponse.json({ success: true, data: { id: 'uuid' } }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'BAD_REQUEST' }, { status: 400 })
  }
}
```

---

## 14. 향후 추가 예정

- 테스트 전략(Jest/Playwright)과 커버리지 기준
- 디자인 토큰 파일(`styles/tokens.css`) 정의 + 버전 관리 방법
- Supabase 스키마/마이그레이션 운영 규칙(Supabase CLI)
- 접근성 체크리스트(ARIA, 키보드 내비게이션)
- 배포 파이프라인(Preview → Staging → Production) 운영 수칙

---

본 컨벤션 문서는 `docs/conventions.md`에서 유지·관리합니다. 변경 시 PR에 변경 요약을 포함해 주세요.
