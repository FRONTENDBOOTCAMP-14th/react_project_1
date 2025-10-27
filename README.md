# Study Club Tracker

Next.js + Supabase 기반 스터디 진행 관리/커뮤니티 플랫폼입니다. 팀/개인별 목표 설정, 주차·일간 계획 수립, 진행률 관리, 팀 피드백 및 알림을 지원합니다.

## 핵심 기능

- [스터디 계획 수립]
  - 팀/개인별 학습 목표 등록
  - 주차별·일별 계획 관리
- [진행률 관리]
  - 개인 학습 진행률 입력
  - 팀 전체 진행 현황 시각화(그래프/퍼센트)
- [공유 및 피드백]
  - 팀원별 진행 현황 공개
  - 댓글/피드백, 격려/조언
- [알림 및 일정]
  - 마감일, 목표 진행률 미달 시 알림
  - 캘린더 연동(옵션)
- [대시보드]
  - 개인/팀 전체 진행 상황 한눈에 확인
  - 목표 달성률 비교
- [커뮤니티]
  - 참여 가능한 스터디 클럽 추천
  - 스터디 클럽 검색
- [계정]
  - Supabase Auth

## 기술 스택

- 프레임워크: Next.js 15 (App Router), React 19, TypeScript
- 데이터베이스: Prisma + PostgreSQL (Supabase)
- 인증: NextAuth v4 (JWT, 카카오 소셜 로그인)
- 미들웨어: Next.js Middleware (라우트 가드, 인증 처리)
- 스타일: VanillaCSS + CSS Modules
- 품질도구: ESLint, Prettier
- 배포: Vercel
- 패키지: Node LTS, pnpm

---

## 아키텍처

### 개요

- 클라이언트: Next.js App Router 기반 서버 컴포넌트 + 클라이언트 컴포넌트 혼합
- 백엔드: Supabase(Postgres) + Row Level Security 정책. 인증/세션은 Supabase Auth
- 통신: Supabase JS 클라이언트, Edge-friendly 패턴 우선
- 배포: Vercel(환경변수로 Supabase 프로젝트 연결)

### 아키텍처 다이어그램

```mermaid
graph LR
  subgraph Client["Next.js (App Router)"]
    UI[React UI + VanillaCSS]
    SSG[SSG/ISR Pages]
    API[Server Actions/Route Handlers]
  end

  Supa["Supabase: Auth + Postgres + Storage + RLS"]
  Noti["Notification/Email (Supabase functions or Vercel Cron)"]
  Cal["Calendar Provider - Optional"]

  UI -->|Supabase JS| Supa
  API -->|Row-level SQL/Views| Supa
  API -->|Webhook/Cron| Noti
  UI -->|OAuth/Email| Supa
  UI -- optional --> Cal
```

---

## 디렉토리 구조

```text
/
├─ app/
│  ├─ *.module.css
│  ├─ (marketing)/
│  │  └─ page.tsx
│  ├─ dashboard/
│  │  ├─ page.tsx
│  │  ├─ teams/[teamId]/page.tsx
│  │  ├─ goals/[goalId]/page.tsx
│  │  └─ clubs/page.tsx
│  ├─ api/
│  │  ├─ progress/route.ts
│  │  ├─ comments/route.ts
│  │  ├─ notifications/route.ts
│  │  └─ clubs/route.ts
│  └─ layout.tsx
├─ components/
│  ├─ charts/ProgressChart.tsx
│  ├─ cards/GoalCard.tsx
│  ├─ tables/TeamProgressTable.tsx
│  ├─ forms/GoalForm.tsx
│  ├─ forms/PlanForm.tsx
│  ├─ comments/CommentList.tsx
│  └─ ui/
├─ lib/
│  ├─ supabase/client.ts
│  ├─ supabase/server.ts
│  ├─ auth.ts
│  ├─ validators/
│  └─ utils.ts
├─ styles/
│  ├─ globals.css
│  └─ common/
│     ├─ reset.css
│     ├─ animation.css
│     ├─ a11y.css
│     └─ variable.css
├─ scripts/
├─ .eslintrc.cjs
├─ .prettierrc
├─ package.json / pnpm-lock.yaml
└─ README.md
```

---

## 데이터 모델 (ERD & 스키마)

[데이터 모델 문서](docs/data-model.md)참고

---

## 주요 사용자 플로우

- [온보딩/로그인]
  - 이메일/비번 또는 OAuth → 세션 획득 → `dashboard` 이동
- [목표/계획]
  - 개인/팀 목표 생성 → 기간/단위 설정 → 일간 계획 등록
- [진행률 입력]
  - 일별 학습량 기록 → 목표 대비 누적/일별 그래프 갱신
  - 팀 대시보드에서 멤버별 진행률 비교 → 댓글/격려
- [알림]
  - 미입력/마감 임박/저조 알림 생성
- [커뮤니티]
  - 클럽 검색/추천 → 가입 → 팀/목표 연결(옵션)

---

## 기능별 개발 스코프 및 계획(간략)

- [MVP]
  - Auth: Supabase 이메일 로그인
  - 목표/계획: `study_goals`, `plans` CRUD
  - 진행률: `progress_entries` 작성, 개인 대시보드(누적/일간 그래프)
  - 팀: `teams`, `team_members` CRUD, 팀 대시보드
  - 피드백: `comments` 목록/생성
  - 알림(기본): 저조/마감 임박 계산(크론/서버 액션)

---

## API/페이지 설계(요약)

- Pages
  - `/dashboard`
  - `/dashboard/teams/[teamId]`
  - `/dashboard/goals/[goalId]`
  - `/dashboard/clubs`
- API(Route Handlers)
  - `POST /api/progress`
  - `GET/POST /api/comments`
  - `GET/POST /api/notifications`
  - `GET /api/clubs`

---

## 인증 및 보안

### Next.js 미들웨어 통합

이 프로젝트는 **Next.js 미들웨어**와 **NextAuth**를 통합하여 일관된 인증 및 보안을 제공합니다.

#### 주요 특징

- **자동 라우트 보호**: 모든 보호된 라우트에 대해 서버 측에서 자동 인증 확인
- **성능 최적화**: 인증되지 않은 사용자의 불필요한 페이지 로드 방지
- **일관된 보안**: 각 API 라우트에서 인증 코드 반복 제거
- **JWT 기반**: 빠르고 확장 가능한 토큰 기반 인증

#### 보호된 라우트

- `/goal/*` - 목표 관리 페이지
- `/profile/*` - 프로필 페이지
- `/api/goals/*` - 목표 API
- 기타 보호된 API 엔드포인트

자세한 내용은 [미들웨어 인증 문서](docs/middleware-auth.md)를 참고하세요.

---

## 로컬 개발 가이드

### 사전 준비

- Node LTS, pnpm 설치
- PostgreSQL 데이터베이스 (Supabase 또는 로컬)
- 카카오 개발자 계정 (소셜 로그인용)

### 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 값을 설정합니다:

```bash
cp .env.example .env
```

필수 환경 변수:

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

### 설치 및 실행

```bash
pnpm install
pnpm dev
```

### 스크립트(예시)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  }
}
```

### 스타일

- 전역 스타일은 `app/layout.tsx`에서 `app/globals.css`를 임포트
- `*.module.css`로 컴포넌트 스타일링

### ESLint/Prettier/CI

- `eslint.config.mjs` Flat Config 기반 설정
- GitHub Actions `.github/workflows/ci.yml`에서 `pnpm lint`, `pnpm typecheck` 자동 실행
- `pnpm format`으로 Prettier 적용

---

## 배포

- Vercel Git 연동 → Project 생성
- 환경변수 설정
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 빌드: 프레임워크 `Next.js`, 루트 `/`
- Supabase RLS/Seed 적용

---

## 보안/개인정보 고려

- RLS로 목표/댓글/진행률 접근 제어
- 서비스 롤 키는 서버 전용
- 최소수집·필요시 익명화

---

## 향후 로드맵

- 모바일 최적화
- 파일 업로드(학습 인증) + Storage
- 고급 추천/리마인더
- 외부 캘린더 양방향 동기화

---

## 로컬 확인

- 앱: <http://localhost:3000/>
- 헬스체크: <http://localhost:3000/api/health>
