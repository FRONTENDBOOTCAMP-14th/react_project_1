-- 날짜 범위 조회를 위한 인덱스 제거
DROP INDEX IF EXISTS idx_round_dates;

-- rounds 테이블에서 start_date, end_date, location 컬럼 제거
ALTER TABLE rounds
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS end_date,
DROP COLUMN IF EXISTS location;
