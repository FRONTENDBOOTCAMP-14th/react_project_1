-- =====================================================
-- Re-enable RLS on all tables after testing
-- Run this in Supabase SQL Editor
-- This restores security policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Verification query (optional)
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'communities', 'study_goals', 'reactions', 'community_members')
ORDER BY tablename;

-- Expected result: rowsecurity = true for all tables

-- Note: RLS policies are still defined and will be enforced again
-- Check existing policies:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
