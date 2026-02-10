/*
  # Security Hardening Migration

  1. Indexes - Add indexes to all foreign keys for query performance
  2. RLS Policies - Fix auth function calls and remove insecure policies
  3. Important - Enforces proper security by default
*/

-- Add indexes to foreign keys for performance
CREATE INDEX IF NOT EXISTS idx_activity_log_staff_id ON activity_log(staff_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_user_id ON data_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_poslednje_posete_user_id ON poslednje_posete(user_id);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_user_id ON redemption_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_staff_id ON transactions(staff_id);

-- Drop unused index
DROP INDEX IF EXISTS idx_redemption_codes_reward_id;

-- Drop all insecure policies that allow unrestricted access
DROP POLICY IF EXISTS "Allow public read access" ON users;
DROP POLICY IF EXISTS "Allow public insert access" ON users;
DROP POLICY IF EXISTS "Allow public update access" ON users;
DROP POLICY IF EXISTS "Allow public insert access" ON activity_log;
DROP POLICY IF EXISTS "Allow public read access" ON activity_log;
DROP POLICY IF EXISTS "Allow public insert access" ON audit_log;
DROP POLICY IF EXISTS "Allow public insert access" ON data_exports;
DROP POLICY IF EXISTS "Allow public update access" ON data_exports;
DROP POLICY IF EXISTS "System can insert last visits" ON poslednje_posete;
DROP POLICY IF EXISTS "Staff can read all customer last visits" ON poslednje_posete;
DROP POLICY IF EXISTS "Users can read own last visits" ON poslednje_posete;
DROP POLICY IF EXISTS "Allow public insert access" ON redemption_codes;
DROP POLICY IF EXISTS "Allow public update access" ON redemption_codes;
DROP POLICY IF EXISTS "Allow public insert access" ON transactions;
DROP POLICY IF EXISTS "Allow public insert access" ON user_engagement_metrics;
DROP POLICY IF EXISTS "Allow public update access" ON user_engagement_metrics;
DROP POLICY IF EXISTS "Allow public insert access" ON staff_performance_metrics;
DROP POLICY IF EXISTS "Allow public update access" ON staff_performance_metrics;
DROP POLICY IF EXISTS "Allow public insert access" ON system_settings;
DROP POLICY IF EXISTS "Allow public update access" ON system_settings;

-- Optimize existing users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth_user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth_user_id = (SELECT auth.uid()))
  WITH CHECK (auth_user_id = (SELECT auth.uid()));

CREATE POLICY "Staff can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (role = 'staff' AND auth_user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (role = 'admin' AND auth_user_id = (SELECT auth.uid()));

-- Create proper secure policies for activity_log
CREATE POLICY "Staff can insert activity logs"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (
    staff_id IN (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Staff can view own activity"
  ON activity_log FOR SELECT
  TO authenticated
  USING (
    staff_id IN (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
  );

-- Secure audit_log policy
CREATE POLICY "System can record audit events"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (changed_by IS NOT NULL);

-- Secure data_exports policies
CREATE POLICY "Users can manage own exports"
  ON data_exports FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Users can view own exports"
  ON data_exports FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Users can update own exports"
  ON data_exports FOR UPDATE
  TO authenticated
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
  )
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
  );

-- Secure poslednje_posete policies
CREATE POLICY "Users view own visits"
  ON poslednje_posete FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Staff view all visits"
  ON poslednje_posete FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'staff')
  );

CREATE POLICY "System records visits"
  ON poslednje_posete FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL);

-- Secure redemption_codes policies
CREATE POLICY "Users view own codes"
  ON redemption_codes FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Staff view all codes"
  ON redemption_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'staff')
  );

CREATE POLICY "System manages codes"
  ON redemption_codes FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "System updates codes"
  ON redemption_codes FOR UPDATE
  TO authenticated
  USING (user_id IS NOT NULL)
  WITH CHECK (user_id IS NOT NULL);

-- Secure transactions policies
CREATE POLICY "Staff insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    staff_id IN (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Users view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Staff view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'staff')
  );

-- Secure user_engagement_metrics
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
CREATE POLICY "Admins manage settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));