-- Community 테이블에서 region, sub_region 컬럼 제거
ALTER TABLE communities
DROP COLUMN IF EXISTS region,
DROP COLUMN IF EXISTS sub_region;

-- 관련 인덱스도 함께 제거
DROP INDEX IF EXISTS idx_community_region;
DROP INDEX IF EXISTS idx_community_sub_region;
