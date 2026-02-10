/*
  # Fix Inefficient RLS Policy Performance

  Replace direct auth.uid() calls with (select auth.uid()) to prevent
  re-evaluation on each row and improve query performance at scale.
  
  See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own last visits" ON poslednje_posete;
DROP POLICY IF EXISTS "Staff can read all customer last visits" ON poslednje_posete;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can read own last visits" ON poslednje_posete FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Staff can read all customer last visits" ON poslednje_posete FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'staff'
    )
  );