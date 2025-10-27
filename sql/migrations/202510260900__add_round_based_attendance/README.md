# Migration: Add Round-based Attendance

## Date

2025-10-26 09:00

## Description

스터디 라운드별 출석 관리 기능을 추가합니다. 각 스터디 회차(Round)에 대한 사용자 출석 정보를 기록하고 관리할 수 있습니다.

## Changes

### 새 테이블: attendance

- `attendance_id` (UUID, PK): 출석 고유 ID
- `user_id` (UUID, NOT NULL, FK): 출석한 사용자 ID
- `round_id` (UUID, NOT NULL, FK): 출석한 스터디 라운드 ID
- `attendance_date` (TIMESTAMP, NOT NULL): 출석 날짜/시간
- `attendance_type` (VARCHAR(16), NOT NULL): 출석 타입
- `created_at` (TIMESTAMP, NOT NULL): 출석 기록 생성일
- `updated_at` (TIMESTAMP, NOT NULL): 출석 기록 수정일
- `deleted_at` (TIMESTAMP, nullable): 소프트 삭제 시각

### 제약조건

- `fk_attendance_user`: 사용자 삭제 시 관련 출석 기록도 삭제 (CASCADE)
- `fk_attendance_round`: 라운드 삭제 시 관련 출석 기록도 삭제 (CASCADE)
- `uk_attendance_round_user`: 한 사용자가 같은 라운드에 중복 출석 방지
- `chk_attendance_type`: 출석 타입 값 제한 ('present', 'absent', 'late', 'excused')

### 인덱스

- `idx_attendance_round`: 라운드별 출석 조회 최적화
- `idx_attendance_user`: 사용자별 출석 조회 최적화
- `idx_attendance_date`: 날짜별 출석 조회 최적화
- `idx_attendance_user_date`: 사용자별 날짜순 출석 조회 최적화
- `idx_attendance_active`: 활성 출석 기록 조회 최적화

### 트리거

- `trg_attendance_updated_at`: updated_at 자동 갱신 트리거

## Impact

- 기존 데이터: 새 테이블이므로 기존 데이터에 영향 없음
- 애플리케이션: Attendance 타입 정의 및 출석 관리 API 추가 필요
- 사용자 경험: 스터디 모임 후 출석 체크 기능 사용 가능

## Usage Example

```sql
-- 특정 라운드의 출석 현황 조회
SELECT
  r.round_number,
  r.start_date,
  r.location,
  u.username,
  u.nickname,
  a.attendance_type,
  a.attendance_date
FROM rounds r
JOIN attendance a ON r.round_id = a.round_id
JOIN users u ON a.user_id = u.user_id
WHERE r.round_id = 'round-uuid-here'
  AND a.deleted_at IS NULL
ORDER BY a.attendance_date DESC;

-- 사용자의 출석 통계 조회
SELECT
  COUNT(*) as total_attendance,
  COUNT(CASE WHEN attendance_type = 'present' THEN 1 END) as present_count,
  COUNT(CASE WHEN attendance_type = 'absent' THEN 1 END) as absent_count,
  COUNT(CASE WHEN attendance_type = 'late' THEN 1 END) as late_count
FROM attendance
WHERE user_id = 'user-uuid-here'
  AND deleted_at IS NULL
  AND attendance_date >= '2025-01-01';

-- 출석 체크 (모임 후)
INSERT INTO attendance (user_id, round_id, attendance_type)
VALUES ('user-uuid-here', 'round-uuid-here', 'present');

-- 출석 수정 (지각으로 변경)
UPDATE attendance
SET attendance_type = 'late', updated_at = NOW()
WHERE user_id = 'user-uuid-here'
  AND round_id = 'round-uuid-here';

-- 출석 취소 (소프트 삭제)
UPDATE attendance
SET deleted_at = NOW()
WHERE user_id = 'user-uuid-here'
  AND round_id = 'round-uuid-here';
```

## Rollback

`rollback.sql` 파일을 실행하여 attendance 테이블을 제거할 수 있습니다.
