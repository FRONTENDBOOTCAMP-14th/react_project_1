# Migration: Reaction Member-based Update

## Date

2025-10-28 11:43

## Description

Reaction 테이블을 goal 기반에서 member 기반으로 변경하여, 멤버에 대한 댓글/리액션을 저장할 수 있도록 합니다.

## Changes

### Reaction 테이블 수정

1. **컬럼 변경**
   - `goal_id` → `member_id`: StudyGoal 참조를 CommunityMember 참조로 변경
   - `emoji` → `reaction`: 이모지뿐 아니라 댓글도 저장할 수 있도록 컬럼명 변경

2. **외래 키 변경**
   - `fk_reaction_goal` 제거
   - `fk_reaction_member` 추가: CommunityMember 참조

3. **제약조건 변경**
   - `uk_reaction_user_goal` (UNIQUE) 제거: 같은 사용자가 같은 멤버에게 여러 댓글을 남길 수 있도록 허용

4. **인덱스 변경**
   - `idx_reaction_goal` 제거
   - `idx_reaction_member` 추가: 멤버별 리액션 조회 최적화

### CommunityMember 테이블 수정

- Prisma 관계 필드 추가 (DB 스키마 변경 없음)
- `reactions Reaction[]`: 역방향 관계

### StudyGoal 테이블 수정

- Prisma 관계 필드 제거 (DB 스키마 변경 없음)
- `reactions Reaction[]` 제거

## Impact

- **기존 데이터**: reactions 테이블의 기존 데이터는 삭제됩니다 (goal_id를 member_id로 매핑할 수 없음)
- **애플리케이션**: Reaction 관련 API 및 타입 정의 수정 필요
- **사용자 경험**: 멤버 프로필에 댓글/리액션 기능 추가 가능

## Usage Example

```sql
-- 특정 멤버에 대한 리액션 조회
SELECT
  cm.user_id,
  u.username,
  u.nickname,
  r.reaction,
  r.created_at,
  reactor.username as reactor_name
FROM community_members cm
JOIN reactions r ON cm.id = r.member_id
JOIN users reactor ON r.user_id = reactor.user_id
JOIN users u ON cm.user_id = u.user_id
WHERE cm.id = 'member-uuid-here'
  AND r.deleted_at IS NULL
ORDER BY r.created_at DESC;

-- 멤버에게 댓글 추가
INSERT INTO reactions (user_id, member_id, reaction)
VALUES ('commenter-user-uuid', 'member-uuid', '멋진 발표였어요! 👍');

-- 리액션 추가 (이모지만)
INSERT INTO reactions (user_id, member_id, reaction)
VALUES ('reactor-user-uuid', 'member-uuid', '👏');

-- 댓글/리액션 수정
UPDATE reactions
SET reaction = '수정된 댓글 내용', updated_at = NOW()
WHERE reaction_id = 'reaction-uuid';

-- 댓글/리액션 삭제 (소프트 삭제)
UPDATE reactions
SET deleted_at = NOW()
WHERE reaction_id = 'reaction-uuid';
```

## Rollback

`rollback.sql` 파일을 실행하여 변경사항을 원래 상태로 되돌릴 수 있습니다.

**주의**: 롤백 시 member 기반으로 생성된 리액션 데이터는 모두 손실됩니다.
