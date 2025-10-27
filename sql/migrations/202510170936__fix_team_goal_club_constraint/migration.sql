-- 마이그레이션: chk_team_goal_club 제약조건 수정
-- 날짜: 2025-10-17 09:36
-- 설명:
--   - 개인 목표도 커뮤니티에 속할 수 있도록 제약조건 수정
--   - 기존: 개인 목표는 club_id가 NULL이어야 함 (잘못됨)
--   - 수정: 개인 목표는 club_id가 있어도 되고 없어도 됨

-- ============================================================================
-- 제약조건 수정
-- ============================================================================

-- 기존 잘못된 제약조건 제거
ALTER TABLE study_goals DROP CONSTRAINT IF EXISTS chk_team_goal_club;

-- 올바른 제약조건 추가: 그룹 목표만 club_id 필수
ALTER TABLE study_goals
ADD CONSTRAINT chk_team_goal_club
CHECK (is_team = false OR (is_team = true AND club_id IS NOT NULL));

-- ============================================================================
-- 문서화
-- ============================================================================
COMMENT ON CONSTRAINT chk_team_goal_club ON study_goals IS
  '그룹 목표(is_team=true)인 경우에만 club_id가 필수적으로 설정되어야 함';
