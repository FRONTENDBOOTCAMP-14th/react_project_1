-- 검색 인덱스 롤백

DROP INDEX IF EXISTS idx_community_search_composite;
DROP INDEX IF EXISTS idx_community_tagname_gin;
DROP INDEX IF EXISTS idx_community_created_at;
DROP INDEX IF EXISTS idx_community_deleted_at;
