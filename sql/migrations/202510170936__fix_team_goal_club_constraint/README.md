# chk_team_goal_club 제약조건 수정 마이그레이션

## 변경 사항

이 마이그레이션은 `study_goals` 테이블의 `chk_team_goal_club` CHECK 제약조건을 수정합니다.

### 문제 상황
기존 제약조건:
```sql
CHECK (
  (is_team = false AND club_id IS NULL) OR
  (is_team = true AND club_id IS NOT NULL)
)
```

이 제약조건은 **개인 목표가 커뮤니티에 속할 수 없도록** 제한하고 있었습니다.

### 해결 방안
수정된 제약조건:
```sql
CHECK (is_team = false OR (is_team = true AND club_id IS NOT NULL))
```

이제:
- ✅ **개인 목표**: `club_id`가 있어도 되고 없어도 됨
- ✅ **그룹 목표**: `club_id`가 반드시 있어야 함

## 실행 방법

### 마이그레이션 적용
```bash
# 마이그레이션 실행
psql -U postgres -d react_project_1 -f sql/migrations/202510170936__fix_team_goal_club_constraint/migration.sql
```

### 롤백
```bash
# 롤백 실행
psql -U postgres -d react_project_1 -f sql/migrations/202510170936__fix_team_goal_club_constraint/rollback.sql
```

## 영향

- 이제 커뮤니티 내에서 개인 목표도 추가할 수 있습니다
- 그룹 목표는 여전히 커뮤니티에 속해야 합니다
- 기존 데이터에는 영향 없음 (개인 목표에 club_id가 있었어도 문제 없음)
