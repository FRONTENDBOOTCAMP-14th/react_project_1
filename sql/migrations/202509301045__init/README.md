# Study Club Tracker - Database Schema & Security

이 마이그레이션은 Study Club Tracker 애플리케이션의 초기 데이터베이스 스키마와 Row Level Security(RLS) 정책을 정의합니다.

## 파일 구조

```
202509301045__init/
├── 202509301045__init.sql          # 스키마 정의 (테이블, 인덱스, 트리거)
├── 202509301045__init_local.sql    # 로컬 실행용 스키마 정의
├── 202509301045__init_rls.sql      # RLS 정책 및 보안 함수
└── README.md                       # 이 문서
```

---

## 🗂️ 데이터베이스 스키마

### 1. **users** - 사용자 테이블

소셜 로그인을 통해 가입한 사용자의 프로필 정보를 저장합니다.

| 컬럼          | 타입      | 설명                                   |
| ------------- | --------- | -------------------------------------- |
| `user_id`     | uuid (PK) | Supabase Auth UID (`auth.uid()`)       |
| `provider`    | varchar   | 소셜 로그인 제공자 (google, github 등) |
| `provider_id` | varchar   | 제공자별 고유 ID                       |
| `email`       | varchar   | 이메일 주소 (선택)                     |
| `username`    | varchar   | 사용자명 (필수, 유니크)                |
| `nickname`    | varchar   | 닉네임 (선택)                          |
| `created_at`  | timestamp | 생성 시각                              |
| `updated_at`  | timestamp | 수정 시각 (자동 업데이트)              |
| `deleted_at`  | timestamp | Soft Delete 시각                       |

**제약조건:**

- Active 사용자 기준 유니크: `(provider, provider_id)`, `email`, `username`
- Soft-delete 지원: `deleted_at IS NULL`인 경우만 활성 사용자

**RLS 정책:**

- [x] 모든 활성 사용자 조회 가능 (검색, 멘션용)
- [x] 본인 프로필만 생성/수정/삭제

---

### 2. **communities** - 커뮤니티(스터디 클럽) 테이블

사용자들이 모여서 학습 목표를 공유하는 커뮤니티입니다.

| 컬럼          | 타입      | 설명                   |
| ------------- | --------- | ---------------------- |
| `club_id`     | uuid (PK) | 커뮤니티 고유 ID       |
| `name`        | varchar   | 커뮤니티 이름 (유니크) |
| `description` | text      | 커뮤니티 설명          |
| `is_public`   | boolean   | 공개 여부 (기본: true) |
| `created_at`  | timestamp | 생성 시각              |
| `updated_at`  | timestamp | 수정 시각              |
| `deleted_at`  | timestamp | Soft Delete 시각       |

**제약조건:**

- Active 커뮤니티 이름 유니크
- `is_public` 인덱스로 공개 커뮤니티 필터링 최적화

**RLS 정책:**

- [x] 공개 커뮤니티: 누구나 조회
- [x] 비공개 커뮤니티: 멤버만 조회
- [x] 생성: 인증된 사용자 누구나
- [x] 수정/삭제: 관리자만

---

### 3. **study_goals** - 학습 목표 테이블

개인 또는 팀 학습 목표를 관리합니다.

| 컬럼          | 타입      | 설명                         |
| ------------- | --------- | ---------------------------- |
| `goal_id`     | uuid (PK) | 목표 고유 ID                 |
| `owner_id`    | uuid (FK) | 목표 생성자 (users.user_id)  |
| `club_id`     | uuid (FK) | 커뮤니티 ID (팀 목표인 경우) |
| `title`       | varchar   | 목표 제목                    |
| `description` | text      | 목표 상세 설명               |
| `is_team`     | boolean   | 팀 목표 여부                 |
| `start_date`  | date      | 시작일                       |
| `end_date`    | date      | 종료일                       |
| `created_at`  | timestamp | 생성 시각                    |
| `updated_at`  | timestamp | 수정 시각                    |
| `deleted_at`  | timestamp | Soft Delete 시각             |

**비즈니스 규칙:**

- [x] `end_date >= start_date` 검증
- [x] 개인 목표: `is_team = false`, `club_id IS NULL`
- [x] 팀 목표: `is_team = true`, `club_id IS NOT NULL`

**RLS 정책:**

- [x] 개인 목표: 소유자만 조회/수정
- [x] 팀 목표: 커뮤니티 멤버가 조회, 소유자만 수정
- [x] 공개 팀 목표: 누구나 조회 (공개 커뮤니티)

---

### 4. **reactions** - 반응(이모지) 테이블

학습 목표에 대한 사용자 반응을 저장합니다.

| 컬럼          | 타입      | 설명             |
| ------------- | --------- | ---------------- |
| `reaction_id` | uuid (PK) | 반응 고유 ID     |
| `user_id`     | uuid (FK) | 반응한 사용자    |
| `goal_id`     | uuid (FK) | 대상 학습 목표   |
| `emoji`       | text      | 이모지 문자열    |
| `created_at`  | timestamp | 생성 시각        |
| `deleted_at`  | timestamp | Soft Delete 시각 |

**제약조건:**

- [x] 유니크: `(user_id, goal_id, emoji)` - 동일 이모지 중복 불가

**RLS 정책:**

- [x] 목표에 접근 가능한 사용자만 반응 조회/추가
- [x] 본인 반응만 수정/삭제

---

### 5. **community_members** - 커뮤니티 멤버십 테이블

사용자와 커뮤니티 간의 멤버십과 권한을 관리합니다.

| 컬럼         | 타입      | 설명                       |
| ------------ | --------- | -------------------------- |
| `id`         | uuid (PK) | 멤버십 고유 ID             |
| `club_id`    | uuid (FK) | 커뮤니티 ID                |
| `user_id`    | uuid (FK) | 사용자 ID                  |
| `role`       | varchar   | 역할 ('admin' \| 'member') |
| `joined_at`  | timestamp | 가입 시각                  |
| `deleted_at` | timestamp | Soft Delete 시각           |

**제약조건:**

- [x] Active 멤버십 유니크: `(club_id, user_id)`
- [x] `role` 값: 'admin' 또는 'member'만 허용

**RLS 정책:**

- [x] 공개 커뮤니티 멤버 목록: 누구나 조회
- [x] 비공개 커뮤니티 멤버 목록: 멤버만 조회
- [x] 멤버 추가: 관리자 또는 공개 커뮤니티 자가 가입
- [x] 역할 변경: 관리자만
- [x] 마지막 관리자 보호: 유일한 관리자는 탈퇴/강등 불가

---

## Row Level Security (RLS)

### 보안 헬퍼 함수

복잡한 권한 로직을 재사용 가능한 함수로 분리했습니다.

#### `is_community_admin(p_club_id uuid, p_user_id uuid)`

```sql
-- 사용자가 해당 커뮤니티의 관리자인지 확인
SELECT is_community_admin('club-uuid', auth.uid());
```

- **반환**: boolean
- **속성**: `SECURITY DEFINER`, `STABLE` (성능 최적화)

#### `is_community_member(p_club_id uuid, p_user_id uuid)`

```sql
-- 사용자가 해당 커뮤니티의 멤버(admin 또는 member)인지 확인
SELECT is_community_member('club-uuid', auth.uid());
```

#### `is_public_community(p_club_id uuid)`

```sql
-- 커뮤니티가 공개인지 확인
SELECT is_public_community('club-uuid');
```

### 정책 설계 원칙

1. **작업 유형별 분리**: SELECT, INSERT, UPDATE, DELETE 정책을 명확히 구분
2. **USING vs WITH CHECK**:
   - `USING`: 기존 행을 필터링 (읽기 권한)
   - `WITH CHECK`: 새로운/수정된 행을 검증 (쓰기 권한)
3. **Soft-delete 존중**: 모든 정책에 `deleted_at IS NULL` 조건 포함
4. **성능 최적화**: 인덱스와 함께 설계된 정책

### 정책 우선순위

RLS는 **OR 조건**으로 동작합니다:

- 하나의 정책이라도 통과하면 접근 허용
- 모든 정책이 거부하면 접근 차단

예시: `study_goals` SELECT 정책

```sql
-- 아래 조건 중 하나라도 만족하면 조회 가능
USING (
  deleted_at IS NULL
  AND (
    owner_id = auth.uid()                    -- 소유자
    OR is_community_member(club_id, ...)     -- 팀 목표의 멤버
    OR is_public_community(club_id)          -- 공개 커뮤니티
  )
);
```

---

## 성능 최적화

### 추가된 인덱스

RLS 정책 실행 시 쿼리 성능을 위한 인덱스:

```sql
-- Auth UID 기반 조회 최적화
CREATE INDEX idx_users_auth_uid ON users (user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_study_goals_owner_auth ON study_goals (owner_id) WHERE deleted_at IS NULL;

-- 멤버십 체크 최적화
CREATE INDEX idx_community_members_club_role ON community_members (club_id, role)
  WHERE deleted_at IS NULL;

-- 공개 커뮤니티 필터링
CREATE INDEX idx_communities_public_active ON communities (is_public)
  WHERE deleted_at IS NULL;

-- 팀 목표 조회 최적화
CREATE INDEX idx_study_goals_club_team ON study_goals (club_id, is_team)
  WHERE deleted_at IS NULL AND is_team = true;
```

### 성능 고려사항

1. **부분 인덱스**: `WHERE deleted_at IS NULL`로 인덱스 크기 감소
2. **복합 인덱스**: 자주 함께 조회되는 컬럼 조합
3. **함수 최적화**: `STABLE` 속성으로 트랜잭션 내 캐싱

---

## 마이그레이션 적용

### Supabase CLI 사용

```bash
# 로컬 개발 환경
supabase db reset

# 프로덕션 적용
supabase db push
```

### 수동 적용

```bash
# 1. 스키마 생성
psql -h your-db-host -U postgres -d your-db \
  -f sql/migrations/202509301045__init/202509301045__init.sql

# 2. RLS 정책 적용
psql -h your-db-host -U postgres -d your-db \
  -f sql/migrations/202509301045__init/202509301045__init_rls.sql
```

### 적용 순서 (중요!)

1. **먼저**: `202509301045__init.sql` (테이블, 인덱스, 트리거)
2. **다음**: `202509301045__init_rls.sql` (RLS 정책, 보안 함수)

RLS 정책은 테이블이 존재해야 적용 가능합니다.

---

## 테스트 쿼리

### 1. 사용자 생성 및 조회

```sql
-- 현재 인증된 사용자 확인
SELECT auth.uid();

-- 사용자 프로필 생성
INSERT INTO users (user_id, provider, provider_id, username, email)
VALUES (auth.uid(), 'google', 'google-123', 'testuser', 'test@example.com');

-- 모든 활성 사용자 조회 (RLS 통과)
SELECT * FROM users WHERE deleted_at IS NULL;
```

### 2. 커뮤니티 생성 및 관리자 설정

```sql
-- 공개 커뮤니티 생성
INSERT INTO communities (name, description, is_public)
VALUES ('React Study', '리액트 스터디 그룹', true)
RETURNING club_id;

-- 자신을 관리자로 추가 (필수!)
INSERT INTO community_members (club_id, user_id, role)
VALUES ('club-uuid', auth.uid(), 'admin');
```

### 3. 팀 목표 생성

```sql
-- 팀 목표 생성 (커뮤니티 멤버만 가능)
INSERT INTO study_goals (owner_id, club_id, title, is_team, start_date, end_date)
VALUES (
  auth.uid(),
  'club-uuid',
  'React Hooks 마스터하기',
  true,
  '2025-10-01',
  '2025-10-31'
);
```

### 4. 반응 추가

```sql
-- 목표에 👍 반응 추가
INSERT INTO reactions (user_id, goal_id, emoji)
VALUES (auth.uid(), 'goal-uuid', '👍');
```

---

## 보안 체크리스트

- [x] 모든 테이블에 RLS 활성화
- [x] auth.uid() 일관성: Supabase Auth와 통합
- [x] Soft-delete 지원: 데이터 복구 가능
- [x] 마지막 관리자 보호: 커뮤니티 고아 방지
- [x] 공개/비공개 분리: 커뮤니티 가시성 제어
- [x] 팀 목표 격리: 멤버십 기반 접근 제어
- [x] 함수 권한: `SECURITY DEFINER`로 제어된 권한 상승
- [x] 인덱스 최적화: RLS 정책 실행 성능 보장

---

## 체크포인트

마이그레이션 적용 후 확인할 사항:

### 1. Extension 및 함수 존재 확인

```sql
-- pgcrypto extension
SELECT extname FROM pg_extension WHERE extname = 'pgcrypto';

-- 사용자 정의 함수
SELECT proname FROM pg_proc WHERE proname IN (
  'set_updated_at',
  'is_community_admin',
  'is_community_member',
  'is_public_community'
);

-- Supabase auth.uid 함수
SELECT proname FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'auth' AND p.proname = 'uid';
```

### 2. RLS 활성화 확인

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('users', 'communities', 'study_goals', 'reactions', 'community_members')
  AND schemaname = 'public';
-- 모든 테이블의 rowsecurity = true 여야 함
```

### 3. 정책 개수 확인

```sql
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename;
-- users: 4개, communities: 4개, study_goals: 4개, reactions: 4개, community_members: 4개
```

### 4. 인덱스 확인

```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'communities', 'study_goals', 'reactions', 'community_members')
ORDER BY tablename, indexname;
```

---

## 롤백 (필요 시)

RLS 정책만 제거:

```sql
-- 모든 RLS 정책 삭제
DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
-- ... (모든 정책)

-- 보안 함수 삭제
DROP FUNCTION IF EXISTS is_community_admin(uuid, uuid);
DROP FUNCTION IF EXISTS is_community_member(uuid, uuid);
DROP FUNCTION IF EXISTS is_public_community(uuid);

-- RLS 비활성화 (주의!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ... (모든 테이블)
```

전체 스키마 롤백:

```sql
DROP TABLE IF EXISTS community_members CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS study_goals CASCADE;
DROP TABLE IF EXISTS communities CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
```

---

## 참고 자료

- [Supabase Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 공식 문서](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth 헬퍼](https://supabase.com/docs/guides/auth/auth-helpers)

---
