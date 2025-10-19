-- rounds 테이블에 start_date, end_date, location 컬럼 추가
ALTER TABLE rounds
ADD COLUMN start_date TIMESTAMP(6),
ADD COLUMN end_date TIMESTAMP(6),
ADD COLUMN location VARCHAR;

-- 날짜 범위 조회를 위한 인덱스 추가
CREATE INDEX idx_round_dates ON rounds(start_date, end_date);

-- 문서화를 위한 컬럼 주석 추가
COMMENT ON COLUMN rounds.start_date IS '스터디 회차 시작 일시 (YYYY-MM-DD HH:mm:ss)';
COMMENT ON COLUMN rounds.end_date IS '스터디 회차 종료 일시 (YYYY-MM-DD HH:mm:ss)';
COMMENT ON COLUMN rounds.location IS '스터디 회차 장소/기관';
