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
  psql "$DATABASE_URL" -f sql/migrations/202509301045__init/202509301045__init.sql
  # 또는 컨테이너 내부 psql 사용
  docker exec -i tokkinote-postgres psql -U postgres -d tokkinote < sql/migrations/202509301045__init/202509301045__init.sql
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

  - 선택: `sql/migrations/202509301045__init/202509301045__init_local.sql` (순정 Postgres에서 Supabase 함수 미사용 버전)
    - 차이점: `users.user_id DEFAULT auth.uid()` → `DEFAULT gen_random_uuid()`

    ```sql
    -- 202509301045__init_local.sql 예시의 users 일부만 발췌
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
  psql "$DATABASE_URL" -f sql/migrations/202509301045__init/202509301045__init_local.sql
  # Supabase 호환 함수(auth.uid) 사용 환경이면 기본 스키마 사용
  # psql "$DATABASE_URL" -f sql/migrations/202509301045__init/202509301045__init.sql
  ```

## 파일 구성

- `sql/migrations/`: 버전별 데이터베이스 마이그레이션 디렉토리
  - `YYYYMMDDHHMM__<description>/`: 마이그레이션 SQL 스크립트, README, 롤백 스크립트 포함
- 초기 베이스라인 스키마:
  - `sql/migrations/202509301045__init/202509301045__init.sql` (Supabase 환경)
  - `sql/migrations/202509301045__init/202509301045__init_local.sql` (순정 PostgreSQL 환경)

## 적용 방법(로컬/개발)

1. 데이터베이스 연결 URL을 준비합니다(`.env` 또는 개인 환경변수):
   - `DATABASE_URL=postgres://user:password@host:5432/dbname`
2. 베이스라인 스키마를 DB에 적용합니다:

   ```bash
   psql "$DATABASE_URL" -f sql/migrations/202509301045__init/202509301045__init.sql
   ```

3. 이후 증분 마이그레이션이 필요하면 순차적으로 각 마이그레이션 디렉토리의 `migration.sql`을 적용합니다.

## Docker 빠른 시작(권장)

1. `.env`에 로컬 DB URL 설정(예시는 Docker-compose 기본값):

   ```dotenv
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/tokkinote
   ```

2. Postgres 컨테이너 실행:

   ```bash
   docker compose -f .docker/docker-compose.yml up -d
   ```

3. 스키마 적용:

   ```bash
   psql "$DATABASE_URL" -f sql/migrations/202509301045__init/202509301045__init.sql
   ```

4. Prisma 사용 시 `.env`의 `DATABASE_URL`을 그대로 읽어옵니다.
   - 예: `pnpm prisma migrate dev` 또는 `pnpm prisma db push`

## Prisma와의 정렬(Alignment)

- Prisma 스키마 파일(`prisma/schema.prisma`)은 테이블/컬럼/일반 제약 조건을 정의합니다.
- 다음 항목은 Prisma 스키마로 직접 표현할 수 없습니다. SQL로 관리하세요:
  - 부분 유니크 인덱스(Partial Unique Index)
  - 일부 고급 체크 제약과 트리거(예: `updated_at` 자동 갱신 트리거)
- 권장 워크플로우:
  1. Prisma 모델 수정 → `prisma migrate dev`로 기반 마이그레이션 생성
  2. 생성된 SQL에 필요한 인덱스/트리거(Partial Unique 등)를 수동 추가
  3. `psql`로 적용 또는 Prisma 마이그레이션에 포함

## 현재 포함 스키마 개요

- `users`: 소셜 로그인 및 회원가입 사용자 (`uk_user_provider_active`, `idx_user_active` 등)
- `communities`: 스터디 커뮤니티 (`region`, `sub_region`, `image_url`, `tagname` GIN 인덱스, 복합 검색 인덱스 포함)
- `study_goals`: 목표 관리 (`owner_id`, `club_id`, `round_id`, `is_team`, `is_complete` 인덱스 및 정합성 체크 제약 포함)
- `reactions`: 커뮤니티 멤버 대상 피드백/댓글 (`member_id` 종속, 텍스트 반응 및 다중 작성 지원)
- `community_members`: 커뮤니티 가입 멤버 (단일 PK `id` + 활성행 대상 `(club_id, user_id)` 부분 유니크 인덱스)
- `rounds`: 스터디 회차 일정 및 장소 (`round_number`, `start_date`, `end_date`, `location`)
- `notifications`: 커뮤니티 공지사항 (`author_id`, `is_pinned`, 정렬 인덱스)
- `attendance`: 회차별 유저 출석 기록 (`round_id`, `user_id`, `attendance_type`, 유니크 제약 `(round_id, user_id)`)

## 마이그레이션 이력 (Migrations History)

| 마이그레이션 디렉토리                           | 요약 설명                                                                                             |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `202509301045__init`                            | 초기 베이스라인 스키마 생성 (`users`, `communities`, `study_goals`, `reactions`, `community_members`) |
| `202510010242__migration`                       | 기본 스키마 제약조건 및 인덱스 업데이트                                                               |
| `202510131147__nextauth_alignment`              | NextAuth v4 세션 및 계정 호환성 정렬                                                                  |
| `202510161107__add_rounds_and_goal_completion`  | `rounds` 테이블 신설 및 `study_goals` 완료 여부(`is_complete`), 회차 연결(`round_id`) 추가            |
| `202510162132__add_goal_club_consistency`       | 목표-커뮤니티 소속 정합성 체크 제약조건(`chk_team_goal_club`) 추가                                    |
| `202510170936__fix_team_goal_club_constraint`   | 개인/팀 목표별 `club_id` 제약조건 정상화                                                              |
| `202510171118__add_round_schedule_and_location` | 회차 모임 일정(`start_date`, `end_date`) 및 장소(`location`) 컬럼 추가                                |
| `202510201046__add_notifications`               | 커뮤니티 공지사항 테이블(`notifications`) 신설 및 인덱스 생성                                         |
| `202510260000__add_community_region_fields`     | 커뮤니티 지역 필드(`region`, `sub_region`) 및 검색 인덱스 추가                                        |
| `202510260900__add_round_based_attendance`      | 회차 기반 출석 테이블(`attendance`) 신설 및 중복 방지 유니크 제약 추가                                |
| `202510281143__reaction_member_based`           | `reactions` 테이블을 goal 기반에서 member 기반(`member_id`)으로 개편 및 텍스트 댓글 지원              |
| `202510281536__add_community_image_url`         | 커뮤니티 대표 이미지(`image_url`) 컬럼 추가                                                           |
| `202511101243__add_community_search_indexes`    | 커뮤니티 태그 GIN 인덱스(`idx_community_tagname_gin`) 및 복합 검색 인덱스 추가                        |

## 명명 규칙

- 디렉토리: `YYYYMMDDHHMM__<short-description>`
- 제약조건: `pk_*`, `fk_*`, `uk_*`, `chk_*`
- 인덱스: `idx_*`

## 주의사항

- **소프트 삭제 자동화**: `lib/prisma/middleware.ts`에서 Prisma Client Extensions(`$extends`)로 소프트 삭제가 자동 처리됩니다.
  - find 계열 쿼리: 자동으로 `WHERE deleted_at IS NULL` 조건 추가
  - delete 쿼리: 자동으로 `UPDATE SET deleted_at = NOW()`로 변환
  - 비즈니스 로직에서 `deletedAt` 필터를 수동으로 추가할 필요 없음
- 부분 유니크 인덱스는 Prisma 스키마에 직접 반영되지 않습니다. 스키마 드리프트를 막기 위해 본 가이드와 SQL 마이그레이션 스크립트를 단일 진실 공급원(SSOT)으로 유지하세요.
