/*
  # Audit Trail and Analytics Tables

  ## Overview
  Adds comprehensive audit logging, analytics, and reporting capabilities
  to track all database changes and user engagement metrics.

  ## New Tables
  1. audit_log - Complete audit trail of all changes
  2. user_engagement_metrics - Track user activity and engagement
  3. staff_performance_metrics - Track staff productivity
  4. system_settings - Configuration and feature flags
  5. data_exports - Track exported data for compliance

  ## Features
  - Complete audit trail with before/after values
  - Automatic timestamp tracking
  - User engagement scoring
  - Staff performance analytics
  - System configuration management
  - Data export logging for GDPR compliance
*/

-- ============================================================================
-- 1. Create audit_log table for complete change tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  table_name text NOT NULL,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id uuid,
  changed_by uuid,
  changed_at timestamptz DEFAULT now(),
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  details text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON audit_log(record_id);

-- ============================================================================
-- 2. Create user_engagement_metrics table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_engagement_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  last_activity_date date,
  last_login date,
  login_count integer DEFAULT 0,
  transaction_count integer DEFAULT 0,
  total_tokens_earned integer DEFAULT 0,
  average_transaction_value numeric DEFAULT 0,
  engagement_score integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON user_engagement_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_is_active ON user_engagement_metrics(is_active);
CREATE INDEX IF NOT EXISTS idx_engagement_score ON user_engagement_metrics(engagement_score DESC);

-- ============================================================================
-- 3. Create staff_performance_metrics table
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_tokens_added integer DEFAULT 0,
  total_redemptions_verified integer DEFAULT 0,
  customers_served integer DEFAULT 0,
  average_daily_tokens integer DEFAULT 0,
  efficiency_score numeric DEFAULT 0,
  last_activity_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_perf_staff_id ON staff_performance_metrics(staff_id);
CREATE INDEX IF NOT EXISTS idx_perf_efficiency_score ON staff_performance_metrics(efficiency_score DESC);

-- ============================================================================
-- 4. Create system_settings table
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  data_type text DEFAULT 'string',
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(setting_key);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, data_type, description) VALUES
  ('tokens_per_rsd', '1', 'numeric', 'Tokens earned per RSD spent'),
  ('max_token_balance', '800', 'integer', 'Maximum tokens a customer can hold'),
  ('redemption_code_expiry_minutes', '30', 'integer', 'Minutes until redemption code expires'),
  ('daily_token_limit_per_staff', '1000', 'integer', 'Maximum tokens staff can add per day'),
  ('welcome_bonus_tokens', '50', 'integer', 'Tokens awarded to new customers'),
  ('maintenance_enabled', 'false', 'boolean', 'Enable maintenance mode'),
  ('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- 5. Create data_exports table for GDPR compliance
-- ============================================================================
CREATE TABLE IF NOT EXISTS data_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  export_type text NOT NULL CHECK (export_type IN ('full_data', 'transactions', 'rewards', 'activity')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_path text,
  file_size integer,
  error_message text,
  requested_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exports_user_id ON data_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON data_exports(status);
CREATE INDEX IF NOT EXISTS idx_exports_expires_at ON data_exports(expires_at);

-- ============================================================================
-- 6. Function to update user engagement metrics
-- ============================================================================
CREATE OR REPLACE FUNCTION update_user_engagement_metrics(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_transaction_count integer;
  v_total_tokens integer;
  v_total_spent numeric;
  v_avg_value numeric;
  v_engagement_score integer;
BEGIN
  -- Get transaction stats
  SELECT 
    COUNT(*),
    COALESCE(SUM(tokens_earned), 0),
    COALESCE(SUM(amount_spent), 0)
  INTO v_transaction_count, v_total_tokens, v_total_spent
  FROM transactions
  WHERE user_id = p_user_id;

  -- Calculate average transaction value
  v_avg_value := CASE WHEN v_transaction_count > 0 THEN v_total_spent / v_transaction_count ELSE 0 END;

  -- Calculate engagement score (0-100)
  v_engagement_score := LEAST(100, 
    LEAST(v_transaction_count * 10, 40) +  -- Transaction frequency (max 40)
    LEAST(v_total_tokens / 10, 30) +        -- Tokens earned (max 30)
    CASE WHEN v_avg_value >= 500 THEN 30 ELSE (v_avg_value / 500 * 30)::integer END -- Transaction value (max 30)
  );

  -- Insert or update engagement metrics
  INSERT INTO user_engagement_metrics (user_id, last_activity_date, transaction_count, total_tokens_earned, 
                                       average_transaction_value, engagement_score)
  VALUES (p_user_id, CURRENT_DATE, v_transaction_count, v_total_tokens, v_avg_value, v_engagement_score)
  ON CONFLICT (user_id) DO UPDATE SET
    last_activity_date = CURRENT_DATE,
    transaction_count = v_transaction_count,
    total_tokens_earned = v_total_tokens,
    average_transaction_value = v_avg_value,
    engagement_score = v_engagement_score,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. Function to update staff performance metrics
-- ============================================================================
CREATE OR REPLACE FUNCTION update_staff_performance_metrics(p_staff_id uuid)
RETURNS void AS $$
DECLARE
  v_tokens_added integer;
  v_redemptions integer;
  v_customers_served integer;
  v_days_active integer;
  v_avg_daily integer;
  v_efficiency_score numeric;
  v_first_activity_date date;
BEGIN
  -- Get staff activity stats
  SELECT 
    COUNT(CASE WHEN a.action = 'added_tokens' THEN 1 END),
    COUNT(CASE WHEN a.action = 'verified_redemption' THEN 1 END),
    COUNT(DISTINCT a.customer_id),
    MIN(a.date)
  INTO v_tokens_added, v_redemptions, v_customers_served, v_first_activity_date
  FROM activity_log a
  WHERE a.staff_id = p_staff_id;

  -- Calculate days active
  v_days_active := COALESCE(GREATEST((CURRENT_DATE - v_first_activity_date)::integer + 1, 1), 1);

  -- Calculate average daily contribution
  v_avg_daily := CASE 
    WHEN v_tokens_added + v_redemptions > 0 
    THEN ((v_tokens_added + v_redemptions) / v_days_active)::integer
    ELSE 0
  END;

  -- Calculate efficiency score (weighted)
  v_efficiency_score := (v_tokens_added * 0.4 + v_redemptions * 0.6)::numeric;

  -- Insert or update performance metrics
  INSERT INTO staff_performance_metrics (staff_id, total_tokens_added, total_redemptions_verified,
                                         customers_served, average_daily_tokens, efficiency_score, last_activity_date)
  VALUES (p_staff_id, v_tokens_added, v_redemptions, v_customers_served, v_avg_daily, v_efficiency_score, CURRENT_DATE)
  ON CONFLICT (staff_id) DO UPDATE SET
    total_tokens_added = v_tokens_added,
    total_redemptions_verified = v_redemptions,
    customers_served = v_customers_served,
    average_daily_tokens = v_avg_daily,
    efficiency_score = v_efficiency_score,
    last_activity_date = CURRENT_DATE,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. Function to get system setting value
-- ============================================================================
CREATE OR REPLACE FUNCTION get_system_setting(p_key text)
RETURNS text AS $$
DECLARE
  v_value text;
BEGIN
  SELECT setting_value INTO v_value
  FROM system_settings
  WHERE setting_key = p_key AND is_active = true;

  RETURN COALESCE(v_value, NULL);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. Function to get analytics report
-- ============================================================================
CREATE OR REPLACE FUNCTION get_analytics_report()
RETURNS TABLE (
  total_customers integer,
  total_staff integer,
  total_tokens_in_circulation integer,
  total_tokens_earned integer,
  total_spent_rsd numeric,
  active_customers integer,
  redemptions_this_month integer,
  average_engagement_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'customer')::integer,
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'staff')::integer,
    COALESCE(SUM(u.token_balance) FILTER (WHERE u.role = 'customer'), 0)::integer,
    COALESCE(SUM(u.total_tokens_earned) FILTER (WHERE u.role = 'customer'), 0)::integer,
    COALESCE(SUM(u.total_spent) FILTER (WHERE u.role = 'customer'), 0)::numeric,
    COUNT(DISTINCT uem.user_id) FILTER (WHERE uem.is_active = true)::integer,
    COUNT(DISTINCT rc.code) FILTER (WHERE rc.redeemed = true AND EXTRACT(MONTH FROM rc.redeemed_at) = EXTRACT(MONTH FROM now()))::integer,
    ROUND(AVG(uem.engagement_score))::numeric
  FROM users u
  LEFT JOIN user_engagement_metrics uem ON u.id = uem.user_id
  LEFT JOIN redemption_codes rc ON u.id = rc.user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. Trigger to auto-update engagement metrics on transaction insert
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_update_engagement_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_user_engagement_metrics(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_engagement_on_transaction ON transactions;
CREATE TRIGGER trg_update_engagement_on_transaction
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_engagement_on_transaction();

-- ============================================================================
-- 11. Trigger to auto-update staff metrics on activity log insert
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_update_staff_performance()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_staff_performance_metrics(NEW.staff_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_staff_performance ON activity_log;
CREATE TRIGGER trg_update_staff_performance
  AFTER INSERT ON activity_log
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_staff_performance();

-- ============================================================================
-- 12. Add helpful comments
-- ============================================================================
COMMENT ON TABLE audit_log IS 'Complete audit trail for all database changes';
COMMENT ON TABLE user_engagement_metrics IS 'Tracks user engagement and activity metrics';
COMMENT ON TABLE staff_performance_metrics IS 'Tracks staff productivity and performance';
COMMENT ON TABLE system_settings IS 'Application configuration and feature settings';
COMMENT ON TABLE data_exports IS 'GDPR data export requests and tracking';

COMMENT ON FUNCTION get_analytics_report IS 'Returns comprehensive analytics for the entire system';
COMMENT ON FUNCTION get_system_setting IS 'Retrieves a system configuration value';
COMMENT ON FUNCTION update_user_engagement_metrics IS 'Updates user engagement scores and metrics';
COMMENT ON FUNCTION update_staff_performance_metrics IS 'Updates staff performance tracking';
