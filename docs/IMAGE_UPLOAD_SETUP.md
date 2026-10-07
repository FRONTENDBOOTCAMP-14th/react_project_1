# 이미지 업로드 기능 설정 가이드

커뮤니티 이미지 업로드 기능이 구현되었습니다. 아래 단계를 따라 설정을 완료해주세요.

> **참고**: 이 프로젝트는 이미 Supabase 데이터베이스를 사용하고 있습니다. 같은 Supabase 프로젝트에서 Storage만 추가로 설정하면 됩니다.

## 1. Supabase Storage 설정

### 1.1 기존 Supabase 프로젝트 사용

현재 데이터베이스로 사용 중인 Supabase 프로젝트에서 Storage를 설정합니다.

### 1.2 Storage Bucket 생성

1. Supabase 대시보드에서 **Storage** 메뉴로 이동
2. **New bucket** 클릭
3. Bucket 이름: `community-images`
4. Public bucket으로 설정 (체크박스 선택)
5. **Create bucket** 클릭

### 1.3 Storage 정책 설정 (선택사항)

기본적으로 public bucket은 읽기가 가능하지만, 업로드 권한을 제한하려면:

1. Storage > Policies로 이동
2. `community-images` bucket 선택
3. 필요한 정책 추가 (예: 인증된 사용자만 업로드 가능)

## 2. 환경 변수 설정

`.env` 파일에 다음 환경 변수를 추가하세요 (이미 사용 중인 Supabase 프로젝트 정보):

```env
# Supabase 설정 (Storage 및 Database 공통)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 환경 변수 값 찾기

현재 `DATABASE_URL`에 사용 중인 Supabase 프로젝트의 정보를 사용합니다:

1. Supabase 대시보드에서 **Settings** > **API** 메뉴로 이동
2. **Project URL**을 복사하여 `SUPABASE_URL`에 입력
3. **Project API keys** 섹션에서 `anon` `public` 키를 복사하여 `SUPABASE_ANON_KEY`에 입력

> **중요**: 데이터베이스와 Storage는 같은 Supabase 프로젝트를 사용합니다.

## 3. 데이터베이스 스키마 및 마이그레이션

커뮤니티 대표 이미지 저장을 위한 `image_url` 필드가 이미 Prisma 스키마(`prisma/schema.prisma`) 및 마이그레이션(`sql/migrations/202510281536__add_community_image_url`)에 반영되어 있습니다.

### 3.1 신규 환경 배포 시 적용

```bash
# 마이그레이션 적용
pnpm prisma migrate deploy
# 또는 직접 SQL 적용
psql "$DATABASE_URL" -f sql/migrations/202510281536__add_community_image_url/migration.sql
```

## 4. 패키지 의존성

`@supabase/supabase-js` 라이브러리가 이미 프로젝트 의존성(`package.json`)에 포함되어 설치되어 있습니다:

```bash
pnpm install
```

## 5. 개발 서버 실행

설정이 완료되면 개발 서버를 실행하세요:

```bash
pnpm dev
```

## 구현된 기능

### API 엔드포인트

- **POST /api/upload/image**: 이미지 파일 업로드
  - 지원 형식: JPG, PNG, WEBP, GIF
  - 최대 크기: 5MB
  - 인증 필요

### 프론트엔드 컴포넌트

- **ImageUploader**: 이미지 선택, 미리보기, 업로드, 삭제 기능
- **NewCommunity**: 커뮤니티 생성 시 이미지 URL 자동 연동

### 데이터베이스

- `communities` 테이블에 `image_url` 컬럼 추가

## 사용 방법

1. `/community/new` 페이지로 이동
2. 카메라 아이콘 클릭하여 이미지 선택
3. 이미지가 자동으로 업로드되고 미리보기 표시
4. 커뮤니티 정보 입력 후 생성 버튼 클릭
5. 이미지 URL이 커뮤니티 데이터와 함께 저장됨

## 문제 해결

### "Supabase URL과 Anon Key가 환경변수에 설정되지 않았습니다" 에러

- `.env` 파일에 `SUPABASE_URL`과 `SUPABASE_ANON_KEY`가 올바르게 설정되었는지 확인
- 개발 서버를 재시작

### "이미지 업로드 실패" 에러

- Supabase Storage bucket이 `community-images` 이름으로 생성되었는지 확인
- Bucket이 public으로 설정되었는지 확인
- Storage 정책이 업로드를 허용하는지 확인

### Prisma 타입 에러

- `pnpm prisma generate` 명령어로 Prisma Client 재생성
- TypeScript 서버 재시작 (VSCode: Ctrl+Shift+P > "TypeScript: Restart TS Server")

## 다음 단계

- [ ] 이미지 최적화 (리사이징, 압축)
- [ ] 이미지 삭제 API 구현
- [ ] 커뮤니티 수정 시 이미지 변경 기능
- [ ] 이미지 업로드 진행률 표시
- [ ] 다중 이미지 업로드 지원
