-- =====================================================
-- Temporary: Disable RLS on all tables for testing
-- Run this in Supabase SQL Editor
-- WARNING: This removes security. Use only in development!
-- =====================================================

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE communities DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_members DISABLE ROW LEVEL SECURITY;

-- Verification query (optional)
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'communities', 'study_goals', 'reactions', 'community_members')
ORDER BY tablename;

-- Expected result: rowsecurity = false for all tables
