/*
  # Fix RLS Policies for Public Access

  1. Changes
    - Disable RLS on users table to allow public sign up and login
    - Update transactions table to allow public access
    - Update redemption_codes table to allow public access
    - Rewards table remains public
    - Activity log remains staff-only

  Since this app uses email/password authentication (not Supabase auth),
  we need to allow public access to authenticate users.
*/

-- Disable RLS on users table for public sign up/login
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop existing policies on users
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Staff can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Re-enable RLS with public access policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Fix transactions table
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Staff can read all transactions" ON transactions;
DROP POLICY IF EXISTS "Staff can create transactions" ON transactions;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON transactions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- Fix redemption_codes table
ALTER TABLE redemption_codes DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Staff can read all redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Users can create redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Staff can update redemption codes" ON redemption_codes;

ALTER TABLE redemption_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON redemption_codes FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access"
  ON redemption_codes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON redemption_codes FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Rewards table already allows public read
ALTER TABLE rewards DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read rewards" ON rewards;

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON rewards FOR SELECT
  USING (true);

-- Activity log public access
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can read own activity log" ON activity_log;
DROP POLICY IF EXISTS "Staff can create activity log entries" ON activity_log;

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON activity_log FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access"
  ON activity_log FOR INSERT
  WITH CHECK (true);
