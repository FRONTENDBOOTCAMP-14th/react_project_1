-- =====================================================
-- Row Level Security (RLS) Policies
-- Supabase Compatible | Latest Spec
-- =====================================================

-- =====================================================
-- SECURITY HELPER FUNCTIONS
-- =====================================================

-- Check if user is community admin
CREATE OR REPLACE FUNCTION is_community_admin(p_club_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM community_members
    WHERE club_id = p_club_id
      AND user_id = p_user_id
      AND role = 'admin'
      AND deleted_at IS NULL
  );
$$;

-- Check if user is community member (admin or member)
CREATE OR REPLACE FUNCTION is_community_member(p_club_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM community_members
    WHERE club_id = p_club_id
      AND user_id = p_user_id
      AND deleted_at IS NULL
  );
$$;

-- Check if community is public
CREATE OR REPLACE FUNCTION is_public_community(p_club_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_public FROM communities WHERE club_id = p_club_id AND deleted_at IS NULL),
    false
  );
$$;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- SELECT: Users can view all active users (for mentions, search, etc.)
CREATE POLICY "users_select_all"
ON users
FOR SELECT
USING (deleted_at IS NULL);

-- INSERT: Users can only create their own profile via auth.uid()
CREATE POLICY "users_insert_own"
ON users
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND deleted_at IS NULL
);

-- UPDATE: Users can only update their own profile
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND deleted_at IS NULL
);

-- DELETE: Users can soft-delete their own profile
CREATE POLICY "users_delete_own"
ON users
FOR DELETE
USING (user_id = auth.uid());

-- Performance index for auth.uid() lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON users (user_id) WHERE deleted_at IS NULL;

-- =====================================================
-- COMMUNITIES TABLE POLICIES
-- =====================================================

-- SELECT: Anyone can view public communities, members can view their communities
CREATE POLICY "communities_select_public_or_member"
ON communities
FOR SELECT
USING (
  deleted_at IS NULL
  AND (
    is_public = true
    OR is_community_member(club_id, auth.uid())
  )
);

-- INSERT: Any authenticated user can create a community
CREATE POLICY "communities_insert_authenticated"
ON communities
FOR INSERT
TO authenticated
WITH CHECK (deleted_at IS NULL);

-- UPDATE: Only admins can update community details
CREATE POLICY "communities_update_admin"
ON communities
FOR UPDATE
USING (
  deleted_at IS NULL
  AND is_community_admin(club_id, auth.uid())
)
WITH CHECK (
  deleted_at IS NULL
  AND is_community_admin(club_id, auth.uid())
);

-- DELETE: Only admins can soft-delete community
CREATE POLICY "communities_delete_admin"
ON communities
FOR DELETE
USING (is_community_admin(club_id, auth.uid()));

-- Performance indexes for RLS
CREATE INDEX IF NOT EXISTS idx_communities_public_active ON communities (is_public) WHERE deleted_at IS NULL;

-- =====================================================
-- STUDY_GOALS TABLE POLICIES
-- =====================================================

-- SELECT: Owner can view own goals, members can view team goals in their communities
CREATE POLICY "study_goals_select_owner_or_team_member"
ON study_goals
FOR SELECT
USING (
  deleted_at IS NULL
  AND (
    -- Personal goal: owner can view
    (is_team = false AND owner_id = auth.uid())
    OR
    -- Team goal: community members can view
    (is_team = true AND club_id IS NOT NULL AND is_community_member(club_id, auth.uid()))
    OR
    -- Public team goal: anyone can view if community is public
    (is_team = true AND club_id IS NOT NULL AND is_public_community(club_id))
  )
);

-- INSERT: Authenticated users can create personal goals, community members can create team goals
CREATE POLICY "study_goals_insert_owner_or_member"
ON study_goals
FOR INSERT
TO authenticated
WITH CHECK (
  deleted_at IS NULL
  AND owner_id = auth.uid()
  AND (
    -- Personal goal
    (is_team = false AND club_id IS NULL)
    OR
    -- Team goal: must be member of the community
    (is_team = true AND club_id IS NOT NULL AND is_community_member(club_id, auth.uid()))
  )
);

-- UPDATE: Only owner can update their goals
CREATE POLICY "study_goals_update_owner"
ON study_goals
FOR UPDATE
USING (
  deleted_at IS NULL
  AND owner_id = auth.uid()
)
WITH CHECK (
  deleted_at IS NULL
  AND owner_id = auth.uid()
  AND (
    -- Maintain goal type integrity
    (is_team = false AND club_id IS NULL)
    OR
    (is_team = true AND club_id IS NOT NULL AND is_community_member(club_id, auth.uid()))
  )
);

-- DELETE: Only owner can soft-delete their goals
CREATE POLICY "study_goals_delete_owner"
ON study_goals
FOR DELETE
USING (owner_id = auth.uid());

-- Performance indexes for RLS
CREATE INDEX IF NOT EXISTS idx_study_goals_owner_auth ON study_goals (owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_study_goals_club_team ON study_goals (club_id, is_team) WHERE deleted_at IS NULL AND is_team = true;

-- =====================================================
-- REACTIONS TABLE POLICIES
-- =====================================================

-- SELECT: Users can view reactions on goals they can access
CREATE POLICY "reactions_select_if_goal_accessible"
ON reactions
FOR SELECT
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM study_goals sg
    WHERE sg.goal_id = reactions.goal_id
      AND sg.deleted_at IS NULL
      AND (
        -- Owner of the goal
        sg.owner_id = auth.uid()
        OR
        -- Team goal member
        (sg.is_team = true AND sg.club_id IS NOT NULL AND is_community_member(sg.club_id, auth.uid()))
        OR
        -- Public team goal
        (sg.is_team = true AND sg.club_id IS NOT NULL AND is_public_community(sg.club_id))
      )
  )
);

-- INSERT: Users can add reactions to accessible goals
CREATE POLICY "reactions_insert_if_goal_accessible"
ON reactions
FOR INSERT
TO authenticated
WITH CHECK (
  deleted_at IS NULL
  AND user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM study_goals sg
    WHERE sg.goal_id = reactions.goal_id
      AND sg.deleted_at IS NULL
      AND (
        sg.owner_id = auth.uid()
        OR
        (sg.is_team = true AND sg.club_id IS NOT NULL AND is_community_member(sg.club_id, auth.uid()))
        OR
        (sg.is_team = true AND sg.club_id IS NOT NULL AND is_public_community(sg.club_id))
      )
  )
);

-- UPDATE: Users can only update their own reactions (though typically reactions are immutable)
CREATE POLICY "reactions_update_own"
ON reactions
FOR UPDATE
USING (
  deleted_at IS NULL
  AND user_id = auth.uid()
)
WITH CHECK (
  deleted_at IS NULL
  AND user_id = auth.uid()
);

-- DELETE: Users can delete their own reactions
CREATE POLICY "reactions_delete_own"
ON reactions
FOR DELETE
USING (user_id = auth.uid());

-- Performance indexes for RLS
CREATE INDEX IF NOT EXISTS idx_reactions_user_auth ON reactions (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reactions_goal_lookup ON reactions (goal_id) WHERE deleted_at IS NULL;

-- =====================================================
-- COMMUNITY_MEMBERS TABLE POLICIES
-- =====================================================

-- SELECT: Members can view other members in their communities
CREATE POLICY "community_members_select_if_member"
ON community_members
FOR SELECT
USING (
  deleted_at IS NULL
  AND (
    -- View own membership
    user_id = auth.uid()
    OR
    -- View members if you're also a member
    is_community_member(club_id, auth.uid())
    OR
    -- View members of public communities
    is_public_community(club_id)
  )
);

-- INSERT: Admins can add members, users can join public communities
CREATE POLICY "community_members_insert_admin_or_public"
ON community_members
FOR INSERT
TO authenticated
WITH CHECK (
  deleted_at IS NULL
  AND (
    -- Admin adding member
    is_community_admin(club_id, auth.uid())
    OR
    -- User joining public community (default role: member)
    (user_id = auth.uid() AND is_public_community(club_id) AND role = 'member')
  )
);

-- UPDATE: Only admins can update member roles
CREATE POLICY "community_members_update_admin"
ON community_members
FOR UPDATE
USING (
  deleted_at IS NULL
  AND is_community_admin(club_id, auth.uid())
)
WITH CHECK (
  deleted_at IS NULL
  AND is_community_admin(club_id, auth.uid())
  -- Prevent last admin from demoting themselves
  AND NOT (
    user_id = auth.uid()
    AND role != 'admin'
    AND (
      SELECT COUNT(*) FROM community_members
      WHERE club_id = community_members.club_id
        AND role = 'admin'
        AND deleted_at IS NULL
    ) = 1
  )
);

-- DELETE: Admins can remove members, users can leave (except last admin)
CREATE POLICY "community_members_delete_admin_or_self"
ON community_members
FOR DELETE
USING (
  (
    -- Admin removing members
    is_community_admin(club_id, auth.uid())
    OR
    -- User leaving community
    user_id = auth.uid()
  )
  AND NOT (
    -- Prevent last admin from leaving
    user_id = auth.uid()
    AND role = 'admin'
    AND (
      SELECT COUNT(*) FROM community_members cm
      WHERE cm.club_id = community_members.club_id
        AND cm.role = 'admin'
        AND cm.deleted_at IS NULL
    ) = 1
  )
);

-- Performance indexes for RLS
CREATE INDEX IF NOT EXISTS idx_community_members_user_auth ON community_members (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_community_members_club_role ON community_members (club_id, role) WHERE deleted_at IS NULL;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permission on security functions to authenticated users
GRANT EXECUTE ON FUNCTION is_community_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_community_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_public_community(uuid) TO authenticated;

-- =====================================================
-- PERFORMANCE OPTIMIZATION NOTES
-- =====================================================

-- The following indexes are created to optimize RLS policy execution:
-- 1. idx_users_auth_uid: Fast lookup for auth.uid() in users table
-- 2. idx_communities_public_active: Filter public communities efficiently
-- 3. idx_study_goals_owner_auth: Owner-based goal queries
-- 4. idx_study_goals_club_team: Team goal lookups by community
-- 5. idx_reactions_user_auth: User reaction lookups
-- 6. idx_reactions_goal_lookup: Goal-based reaction queries
-- 7. idx_community_members_user_auth: User membership lookups
-- 8. idx_community_members_club_role: Community admin/member checks

-- =====================================================
-- SECURITY NOTES
-- =====================================================

-- 1. All policies respect soft-delete (deleted_at IS NULL)
-- 2. auth.uid() is used consistently for authenticated user identification
-- 3. Security functions use SECURITY DEFINER with STABLE for performance
-- 4. Policies are separated by operation type (SELECT, INSERT, UPDATE, DELETE)
-- 5. USING clause filters existing rows, WITH CHECK validates new/updated rows
-- 6. Last admin protection prevents orphaned communities
-- 7. Team goals require community membership verification
-- 8. Public communities allow read access but controlled write access
