# 프로젝트 이름

**토끼노트 (Rabbit Note)**

## 프로젝트 소개

Nextjs 기반 스터디 진행 관리/커뮤니티 플랫폼입니다. 팀/개인별 목표 설정, 주차·일간 계획 수립, 팀 피드백을 지원합니다.

## 주요 기능

- **스터디 계획 수립**
  - 팀/개인별 학습 목표 등록
  - 주차별·일별 계획 관리
- **공유 및 피드백**
  - 댓글/피드백, 격려/조언
- **커뮤니티**
  - 참여 가능한 스터디 클럽 추천
  - 스터디 클럽 검색
- **계정**
  - 카카오 소셜 로그인

## 기술 스택

### Frontend

- **프레임워크**: Nextjs 15 (App Router), React 19
- **언어**: TypeScript
- **스타일링**: VanillaCSS + CSS Modules
- **상태 관리**: Zustand
- **UI 라이브러리**: Lucide React (Icons), Sonner (Toast Notifications)

### Backend

- **데이터베이스**: Prisma + PostgreSQL (Supabase)
- **인증**: NextAuth v4 (JWT, Kakao OAuth)
- **미들웨어**: Next.js Middleware (Route Guards)

### DevOps & Tools

- **배포**: Vercel
- **패키지 관리자**: pnpm 9.15.9
- **코드 품질**: ESLint (Flat Config), Prettier
- **런타임**: Node LTS

## 실행 방법

### 사전 준비

- Node.js LTS 버전
- pnpm 설치
- PostgreSQL 데이터베이스 (Supabase 권장)
- 카카오 개발자 계정

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

# 데이터베이스 (Supabase)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DIRECT_URL=postgresql://user:password@localhost:5432/dbname

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

앱이 <http://localhost:3000> 에서 실행됩니다.

### 주요 스크립트

```bash
pnpm dev          # 개발 서버 실행
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 실행
pnpm lint         # ESLint 검사
pnpm lint:fix     # ESLint 자동 수정
pnpm format       # Prettier 포맷팅 적용
pnpm typecheck    # TypeScript 타입 체크
```

## 팀원 소개

| 이름   | 역할               | GitHub                                       |
| ------ | ------------------ | -------------------------------------------- |
| 석정일 | Project Leader     | [@but212](https://github.com/but212)         |
| 홍민영 | Project Manager    | [@min830-a](https://github.com/min830-a)     |
| 윤동식 | Backend Developer  | [@Donggle-IV](https://github.com/Donggle-IV) |
| 박철순 | Frontend Developer | [@cjftns](https://github.com/cjftns)         |

## 배포 링크

**배포 URL**: [토끼노트](https://tokkinote.vercel.app/)

## 스크린샷

### 메인 페이지

![메인 페이지](docs/screenshots/main.jpeg)

### 대시보드

![대시보드](docs/screenshots/dashboard.jpeg)

### 커뮤니티

![커뮤니티](docs/screenshots/community.jpeg)

---

## 추가 문서

프로젝트의 상세한 개발 가이드는 `docs/` 폴더를 참고하세요:

- **[conventions.md](docs/conventions.md)** - 코딩 컨벤션 및 스타일 가이드
- **[data-model.md](docs/data-model.md)** - 데이터베이스 스키마 및 ERD
- **[middleware-auth.md](docs/middleware-auth.md)** - Next.js 미들웨어 인증 가이드
- **[IMAGE_UPLOAD_SETUP.md](docs/IMAGE_UPLOAD_SETUP.md)** - Supabase Storage 이미지 업로드 설정
