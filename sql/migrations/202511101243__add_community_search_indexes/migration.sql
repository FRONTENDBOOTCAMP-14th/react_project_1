-- 검색 성능 최적화를 위한 Community 테이블 인덱스 추가

-- 1. deletedAt 인덱스 (소프트 삭제 필터링)
CREATE INDEX IF NOT EXISTS idx_community_deleted_at ON communities(deleted_at);

-- 2. createdAt 인덱스 (정렬 최적화)
CREATE INDEX IF NOT EXISTS idx_community_created_at ON communities(created_at);

-- 3. tagname GIN 인덱스 (배열 검색 최적화)
-- 배열 타입은 기본 GIN 오퍼레이터 사용 (array_ops)
CREATE INDEX IF NOT EXISTS idx_community_tagname_gin ON communities USING gin (tagname);

-- 4. 복합 인덱스 (검색 쿼리 최적화: deletedAt + region + createdAt)
CREATE INDEX IF NOT EXISTS idx_community_search_composite ON communities(deleted_at, region, created_at);

-- 인덱스 주석
COMMENT ON INDEX idx_community_deleted_at IS '소프트 삭제 필터링 성능 최적화';
COMMENT ON INDEX idx_community_created_at IS 'createdAt 정렬 성능 최적화';
COMMENT ON INDEX idx_community_tagname_gin IS '태그 배열 검색 성능 최적화 (hasSome 연산)';
COMMENT ON INDEX idx_community_search_composite IS '검색 필터 조합 쿼리 최적화 (deletedAt + region + 정렬)';
