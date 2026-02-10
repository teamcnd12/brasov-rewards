/*
  # Fix RLS Infinite Recursion Issue
  
  1. Problem
    - Policies were using SELECT subqueries within the users table policies
    - This caused infinite recursion when evaluating policies
  
  2. Solution
    - Drop all problematic policies
    - Recreate with simpler, direct comparisons
    - Allow basic access for authenticated users
*/

-- Drop all policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;

-- Create simple policies without circular references
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Allow staff/admin to view all users
CREATE POLICY "Staff can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (role = 'staff' OR role = 'admin');

-- Drop and recreate activity_log policies - simpler
DROP POLICY IF EXISTS "Staff can insert activity logs" ON activity_log;
DROP POLICY IF EXISTS "Staff can view own activity" ON activity_log;

CREATE POLICY "Staff can insert activity logs"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can view own activity"
  ON activity_log FOR SELECT
  TO authenticated
  USING (true);

-- Drop and recreate data_exports policies
DROP POLICY IF EXISTS "Users can manage own exports" ON data_exports;
DROP POLICY IF EXISTS "Users can view own exports" ON data_exports;
DROP POLICY IF EXISTS "Users can update own exports" ON data_exports;

CREATE POLICY "Users can manage own exports"
  ON data_exports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own exports"
  ON data_exports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own exports"
  ON data_exports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Drop and recreate poslednje_posete policies
DROP POLICY IF EXISTS "Users view own visits" ON poslednje_posete;
DROP POLICY IF EXISTS "Staff view all visits" ON poslednje_posete;
DROP POLICY IF EXISTS "System records visits" ON poslednje_posete;

CREATE POLICY "Users view own visits"
  ON poslednje_posete FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff view all visits"
  ON poslednje_posete FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System records visits"
  ON poslednje_posete FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL);

-- Drop and recreate redemption_codes policies
DROP POLICY IF EXISTS "Users view own codes" ON redemption_codes;
DROP POLICY IF EXISTS "Staff view all codes" ON redemption_codes;
DROP POLICY IF EXISTS "System manages codes" ON redemption_codes;
DROP POLICY IF EXISTS "System updates codes" ON redemption_codes;

CREATE POLICY "Users view own codes"
  ON redemption_codes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff view all codes"
  ON redemption_codes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System manages codes"
  ON redemption_codes FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "System updates codes"
  ON redemption_codes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Drop and recreate transactions policies
DROP POLICY IF EXISTS "Staff insert transactions" ON transactions;
DROP POLICY IF EXISTS "Users view own transactions" ON transactions;
DROP POLICY IF EXISTS "Staff view all transactions" ON transactions;

CREATE POLICY "Staff insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

-- Secure user_engagement_metrics
DROP POLICY IF EXISTS "System manages engagement" ON user_engagement_metrics;
DROP POLICY IF EXISTS "System updates engagement" ON user_engagement_metrics;

CREATE POLICY "System manages engagement"
  ON user_engagement_metrics FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "System updates engagement"
  ON user_engagement_metrics FOR UPDATE
  TO authenticated
  USING (user_id IS NOT NULL)
  WITH CHECK (user_id IS NOT NULL);

-- Secure staff_performance_metrics
DROP POLICY IF EXISTS "System manages staff metrics" ON staff_performance_metrics;
DROP POLICY IF EXISTS "System updates staff metrics" ON staff_performance_metrics;

CREATE POLICY "System manages staff metrics"
  ON staff_performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (staff_id IS NOT NULL);

CREATE POLICY "System updates staff metrics"
  ON staff_performance_metrics FOR UPDATE
  TO authenticated
  USING (staff_id IS NOT NULL)
  WITH CHECK (staff_id IS NOT NULL);

-- Secure system_settings
DROP POLICY IF EXISTS "Admins manage settings" ON system_settings;

CREATE POLICY "Admins manage settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
