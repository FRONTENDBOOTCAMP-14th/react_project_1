-- Community 테이블에 image_url 컬럼 추가
ALTER TABLE communities
ADD COLUMN image_url VARCHAR;

-- 문서화를 위한 컬럼 주석 추가
COMMENT ON COLUMN communities.image_url IS '커뮤니티 대표 이미지 URL (Supabase Storage)';
