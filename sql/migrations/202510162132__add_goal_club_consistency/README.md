# 마이그레이션: Goal-Club 일관성 검사 추가

**날짜:** 2025-10-16 21:32  
**유형:** 데이터 무결성 강화

## 개요

이 마이그레이션은 `study_goals` 테이블에 데이터 일관성 검사와 자동 동기화를 추가하여, `round_id`가 연결된 경우 `club_id`가 항상 해당 라운드의 클럽과 일치하도록 보장합니다.

## 변경 사항

### 1. 인덱스 추가

- 쿼리 성능 향상을 위해 `club_id`에 `idx_goal_club` 인덱스 추가

### 2. 자동 동기화 함수

- `sync_goal_club_id()` 트리거 함수 생성
- `round_id`가 설정될 때 연결된 `round`에서 `club_id`를 자동 설정
- 참조된 라운드가 존재하지 않으면 오류 발생

### 3. 데이터 일관성 트리거

- 트리거: `trg_sync_goal_club_id`
- 실행 시점: `BEFORE INSERT OR UPDATE OF round_id`
- `round_id` 변경 시 항상 `club_id`가 동기화되도록 보장

### 4. 데이터 일관성 검증 트리거

- 트리거: `trg_validate_goal_club_consistency`
- 함수: `validate_goal_club_consistency()`
- `round_id`가 설정된 경우, `club_id`가 라운드의 클럽과 일치하는지 검증
- 독립 목표를 위해 `round_id`는 NULL 허용
- 참고: PostgreSQL의 CHECK 제약조건은 서브쿼리를 허용하지 않으므로 트리거로 구현

### 5. 데이터 마이그레이션

- 기존 레코드를 업데이트하여 일관성 보장
- `round_id`가 있는 모든 목표에 대해 라운드로부터 `club_id` 동기화

## 비즈니스 로직

### 시나리오 1: 라운드가 있는 목표

```sql
-- round_id가 있는 목표를 삽입할 때
INSERT INTO study_goals (owner_id, round_id, title, ...)
VALUES ('user-id', 'round-id', 'My Goal', ...);

-- club_id는 라운드에서 자동으로 설정됨
-- CHECK 제약 조건이 일관성을 검증함
```

### 시나리오 2: 독립 목표 (라운드 없음)

```sql
-- round_id 없이 목표를 삽입할 때
INSERT INTO study_goals (owner_id, club_id, title, ...)
VALUES ('user-id', 'club-id', 'My Goal', ...);

-- club_id는 임의의 값(또는 NULL) 허용
-- 일관성 검사 불필요
```

## 영향

### 긍정적 효과

- ✅ 데이터 불일치 방지 (clubId != round.clubId)
- ✅ 애플리케이션 로직 단순화 (자동 동기화)
- ✅ 쿼리 성능 유지 (clubId 인덱스)
- ✅ 라운드 기반 목표와 독립 목표 모두 지원

### 마이그레이션 안전성

- ✅ 비파괴적: 기존 데이터 자동 업데이트
- ✅ 하위 호환: NULL roundId 여전히 지원
- ✅ 롤백 가능: `rollback.sql` 참조

## 테스트

### 마이그레이션 성공 검증

```sql
-- 1. 동기화 트리거 존재 확인
SELECT tgname, tgtype
FROM pg_trigger
WHERE tgname = 'trg_sync_goal_club_id';

-- 2. 검증 트리거 존재 확인
SELECT tgname, tgtype
FROM pg_trigger
WHERE tgname = 'trg_validate_goal_club_consistency';

-- 3. 데이터 일관성 검증
SELECT COUNT(*)
FROM study_goals sg
JOIN rounds r ON sg.round_id = r.round_id
WHERE sg.club_id != r.club_id;
-- 0을 반환해야 함

-- 4. 자동 동기화 테스트
INSERT INTO study_goals (owner_id, round_id, title, start_date, end_date)
VALUES ('test-user-id', 'test-round-id', 'Test Goal', CURRENT_DATE, CURRENT_DATE);
-- club_id가 자동으로 채워져야 함

SELECT club_id FROM study_goals WHERE title = 'Test Goal';
-- 라운드의 club_id와 일치해야 함
```

## 롤백

필요 시 다음을 실행:

```bash
psql -d your_database -f rollback.sql
```

다음이 수행됩니다:

1. 동기화 트리거 제거
2. 검증 트리거 제거
3. 트리거 함수 제거 (2개)
4. (선택) 인덱스 제거

주의: 데이터 업데이트는 올바른 데이터이므로 롤백하지 않습니다.

## 관련 파일

- `migration.sql` - 순방향 마이그레이션
- `rollback.sql` - 역방향 마이그레이션
- `README.md` - 본 문서

## 의존성

- `club_id` 컬럼이 있는 `rounds` 테이블 필요
- `club_id`, `round_id` 컬럼이 있는 `study_goals` 테이블 필요
