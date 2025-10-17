# Migration: Add Round Schedule and Location

## Date

2025-10-17 11:18

## Description

라운드(Round) 테이블에 스터디 일정과 장소 정보를 추가합니다.

## Changes

- `start_date` (TIMESTAMP(6), nullable): 스터디 시작 일시 (YYYY-MM-DD HH:mm:ss 형식)
- `end_date` (TIMESTAMP(6), nullable): 스터디 종료 일시 (YYYY-MM-DD HH:mm:ss 형식)
- `location` (VARCHAR, nullable): 스터디 장소
- `idx_round_dates`: 날짜/시간 범위 쿼리 최적화를 위한 인덱스

## Impact

- 기존 데이터: 새로운 컬럼은 NULL 허용이므로 기존 데이터에 영향 없음
- 애플리케이션: Round 타입 정의 업데이트 필요

## Usage Example

```sql
-- 라운드 일정 설정
UPDATE rounds
SET start_date = '2025-10-20 14:00:00',
    end_date = '2025-10-20 18:00:00',
    location = '서울 강남구 스터디카페'
WHERE round_id = 'some-uuid';

-- 특정 기간의 라운드 조회
SELECT * FROM rounds
WHERE start_date >= '2025-10-01 00:00:00'
  AND end_date <= '2025-12-31 23:59:59'
  AND deleted_at IS NULL;

-- 오늘 진행 중인 라운드 조회
SELECT * FROM rounds
WHERE start_date <= NOW()
  AND end_date >= NOW()
  AND deleted_at IS NULL;
```

## Rollback

`rollback.sql` 파일을 실행하여 변경사항을 되돌릴 수 있습니다.
