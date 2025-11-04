# 데이터베이스 마이그레이션 가이드

이 디렉토리에는 초기 스키마 및 마이그레이션 SQL이 포함됩니다. Prisma를 사용하더라도 운영상 필요한 일부 인덱스(특히 Partial Unique Index)는 수동 SQL로 관리합니다.

## 로컬 실행 방법

두 가지 경로 중 하나를 선택하세요.

### 1) DOCKER로 실행

- **필요 파일 생성**
  - `./.docker/docker-compose.yml`

    ```yaml
    version: '3.9'
    services:
      postgres:
        image: postgres:16
        container_name: tokkinote-postgres
        environment:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: tokkinote
        ports:
          - '5432:5432'
        volumes:
          - pgdata:/var/lib/postgresql/data
        healthcheck:
          test: ['CMD-SHELL', 'pg_isready -U postgres']
          interval: 5s
          timeout: 5s
          retries: 10
    volumes:
      pgdata:
    ```

  - 프로젝트 루트의 `.env` (또는 기존 `.env`에 추가)

    ```dotenv
    DATABASE_URL=postgres://postgres:postgres@localhost:5432/tokkinote
    ```

- **실행 명령**

  ```bash
  # 컨테이너 시작
  docker compose -f .docker/docker-compose.yml up -d

  # 스키마 적용 (호스트 psql 사용)
  psql "$DATABASE_URL" -f sql/schema.sql
  # 또는 컨테이너 내부 psql 사용
  docker exec -i tokkinote-postgres psql -U postgres -d tokkinote < sql/schema.sql
  ```

### 2) POSTGRESQL 설치로 실행(로컬 설치)

- **사전 준비**
  - Windows용 PostgreSQL 설치(예: EnterpriseDB Installer)
  - 설치 후 환경변수에 `psql` 경로 포함 또는 절대경로 사용

- **필요 파일 생성**
  - 프로젝트 루트의 `.env`

    ```dotenv
    # 로컬 설치 시 본인 설정에 맞춰 비밀번호/포트 변경
    DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/tokkinote
    ```

  - 선택: `sql/schema.local.sql` (순정 Postgres에서 Supabase 함수 미사용 버전)
    - 차이점: `users.user_id DEFAULT auth.uid()` → `DEFAULT gen_random_uuid()`

    ```sql
    -- schema.local.sql 예시의 users 일부만 발췌
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS users (
      user_id     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
      provider    varchar     NOT NULL,
      provider_id varchar     NOT NULL,
      email       varchar     UNIQUE,
      username    varchar     NOT NULL,
      created_at  timestamp   NOT NULL DEFAULT now(),
      updated_at  timestamp   NOT NULL DEFAULT now(),
      deleted_at  timestamp
    );
    ```

- **실행 명령**

  ```bash
  # DB 생성(없다면)
  createdb tokkinote || psql -c "CREATE DATABASE tokkinote;"

  # 스키마 적용: Supabase 함수 미사용 시
  psql "$DATABASE_URL" -f sql/schema.local.sql
  # Supabase 호환 함수(auth.uid) 사용 환경이면 기본 스키마도 가능
  # psql "$DATABASE_URL" -f sql/schema.sql
  ```

## 파일 구성

- `../schema.sql`: 현재 문서화된 데이터 모델을 반영한 스키마 생성 스크립트
- 향후 `YYYYMMDDHHMM__description.sql` 형태로 증분 마이그레이션 파일을 추가합니다.

## 적용 방법(로컬/개발)

1. 데이터베이스 연결 URL을 준비합니다(`.env` 또는 개인 환경변수):
   - `DATABASE_URL=postgres://user:password@host:5432/dbname`
2. `schema.sql`을 DB에 적용합니다. 예시:

   ```bash
   psql "$DATABASE_URL" -f sql/schema.sql
   ```

3. 변경사항이 있으면 신규 마이그레이션 파일을 추가하고, 동일 방식으로 적용합니다.

## Docker 빠른 시작(권장)

1. `.env`에 로컬 DB URL 설정(예시는 Docker-compose 기본값):

   ```dotenv
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/studyclub
   ```

2. Postgres 컨테이너 실행:

   ```bash
   docker compose -f .docker/docker-compose.yml up -d
   ```

3. 스키마 적용:

   ```bash
   psql "$DATABASE_URL" -f sql/schema.sql
   ```

4. Prisma 사용 시 `.env`의 `DATABASE_URL`을 그대로 읽어옵니다.
   - 예: `pnpm prisma migrate dev` 또는 `pnpm prisma db push`

## Prisma와의 정렬(Alignment)

- Prisma 스키마 파일(`prisma/schema.prisma`)은 테이블/컬럼/일반 제약 조건을 정의합니다.
- 다음 항목은 Prisma 스키마로 직접 표현할 수 없습니다. SQL로 관리하세요:
  - 부분 유니크 인덱스(Partial Unique Index)
  - 일부 고급 체스터 제약과 트리거(예: `updated_at` 자동 갱신 트리거)
- 권장 워크플로우:
  1. Prisma 모델 수정 → `prisma migrate dev`로 기반 마이그레이션 생성
  2. 생성된 SQL에 필요한 인덱스/트리거(Partial Unique 등)를 수동 추가
  3. `psql`로 적용 또는 Prisma 마이그레이션에 포함

## 현재 포함 스키마 개요

- `users`: 소셜 로그인 사용자. `uk_user_provider`, `idx_user_active` 등 포함
- `communities`: 커뮤니티. `uk_community_name` 포함
- `study_goals`: 목표. 소유자/기간/팀 여부 인덱스 포함
- `reactions`: 목표에 대한 리액션(`goal_id` 종속). 사용자·목표·이모지 유니크
- `community_members`: 단일 PK(`id`) + 활성행 대상 `(club_id, user_id)` 부분 유니크 인덱스

## 명명 규칙

- 파일: `YYYYMMDDHHMM__<short-description>.sql`
- 제약조건: `pk_*`, `fk_*`, `uk_*`, `chk_*`
- 인덱스: `idx_*`

## 주의사항

- 소프트 삭제(`deleted_at`) 컬럼이 있는 테이블은 기본 조회에서 반드시 `WHERE deleted_at IS NULL` 조건을 적용하세요.
- 부분 유니크 인덱스는 Prisma 스키마에 반영되지 않습니다. 스키마 드리프트를 막기 위해 README와 SQL을 소스오브트루스로 유지하세요.
