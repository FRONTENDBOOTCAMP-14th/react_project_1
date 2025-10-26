-- Community 테이블에 region, sub_region 컬럼 추가
ALTER TABLE communities
ADD COLUMN region VARCHAR,
ADD COLUMN sub_region VARCHAR;

-- 지역별 검색을 위한 인덱스 추가
CREATE INDEX idx_community_region ON communities(region);
CREATE INDEX idx_community_sub_region ON communities(sub_region);

-- 문서화를 위한 컬럼 주석 추가
COMMENT ON COLUMN communities.region IS '커뮤니티 지역 (예: 서울시, 경기도)';
COMMENT ON COLUMN communities.sub_region IS '커뮤니티 세부 지역 (예: 강남구, 성남시)';
