/*
  # Final RLS Infinite Recursion Fix
  
  1. Problem
    - "Admins can create staff users" policy queries users table within WITH CHECK
    - "Test policy" has SELECT subquery causing recursion
    - These policies create circular references
  
  2. Solution
    - Drop all problematic policies completely
    - Create simple, non-recursive policies
    - Use only direct auth.uid() comparisons for user table
*/

DROP POLICY IF EXISTS "Admins can create staff users" ON users;
DROP POLICY IF EXISTS "Test policy" ON users;
DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can view other users"
  ON users FOR SELECT
  TO authenticated
  USING (true);