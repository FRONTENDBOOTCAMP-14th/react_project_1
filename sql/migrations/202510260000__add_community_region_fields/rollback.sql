-- Community 테이블에서 region, subRegion 컬럼 제거
ALTER TABLE communities
DROP COLUMN IF EXISTS region,
DROP COLUMN IF EXISTS subRegion;

-- 관련 인덱스도 함께 제거
DROP INDEX IF EXISTS idx_community_region;
DROP INDEX IF EXISTS idx_community_subRegion;
