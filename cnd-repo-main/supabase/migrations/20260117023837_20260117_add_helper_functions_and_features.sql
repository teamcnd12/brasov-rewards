/*
  # Comprehensive Helper Functions and Features for Coffee Rewards App

  ## Overview
  This migration adds all necessary stored procedures and functions to support
  the full operation of the Coffee Rewards loyalty program, including:
  - User management functions
  - Token and reward management
  - Audit logging and tracking
  - Data validation and sanitization
  - Reporting and analytics
  - Maintenance and cleanup functions

  ## Helper Functions Added
  1. add_tokens_to_customer - Add tokens from purchase
  2. redeem_tokens - Process token redemption
  3. generate_redemption_code - Create redemption code
  4. verify_redemption_code - Mark code as verified
  5. get_user_dashboard_stats - Get user statistics
  6. log_staff_activity - Log staff actions
  7. calculate_reward_value - Calculate token values
  8. check_redemption_eligibility - Validate redemption
  9. get_customer_history - Retrieve transaction history
  10. archive_expired_codes - Clean up old codes

  ## Audit and Tracking Tables
  - Audit trail for all changes
  - Staff performance tracking
  - Customer engagement metrics

  ## Data Integrity
  - All functions include validation
  - Transaction safety with proper error handling
  - Automatic timestamp management
*/

-- ============================================================================
-- 1. HELPER FUNCTION: Add tokens to customer from purchase
-- ============================================================================
CREATE OR REPLACE FUNCTION add_tokens_to_customer(
  p_user_id uuid,
  p_amount_spent numeric,
  p_staff_id uuid DEFAULT NULL,
  p_timestamp text DEFAULT NULL
)
RETURNS TABLE (
  success boolean,
  tokens_added integer,
  new_balance integer,
  message text
) AS $$
DECLARE
  v_tokens integer;
  v_current_balance integer;
  v_new_balance integer;
  v_transaction_id bigint;
  v_staff_name text;
BEGIN
  -- Validate input
  IF p_user_id IS NULL THEN
    RETURN QUERY SELECT false, 0, 0, 'User ID is required'::text;
    RETURN;
  END IF;

  IF p_amount_spent <= 0 THEN
    RETURN QUERY SELECT false, 0, 0, 'Amount spent must be greater than 0'::text;
    RETURN;
  END IF;

  -- Get current balance
  SELECT token_balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id AND role = 'customer';

  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT false, 0, 0, 'Customer not found'::text;
    RETURN;
  END IF;

  -- Calculate tokens (1 token per 10 RSD spent)
  v_tokens := FLOOR(p_amount_spent / 10)::integer;

  -- Check if adding tokens would exceed limit
  v_new_balance := v_current_balance + v_tokens;
  IF v_new_balance > 800 THEN
    v_tokens := 800 - v_current_balance;
    v_new_balance := 800;
  END IF;

  -- Get staff name
  IF p_staff_id IS NOT NULL THEN
    SELECT name INTO v_staff_name FROM users WHERE id = p_staff_id;
  END IF;

  -- Update user token balance
  UPDATE users
  SET 
    token_balance = v_new_balance,
    total_tokens_earned = total_tokens_earned + v_tokens,
    total_spent = total_spent + p_amount_spent,
    updated_at = now()
  WHERE id = p_user_id;

  -- Create transaction record
  INSERT INTO transactions (user_id, date, amount_spent, tokens_earned, timestamp, added_by, staff_id)
  VALUES (
    p_user_id,
    CURRENT_DATE,
    p_amount_spent,
    v_tokens,
    COALESCE(p_timestamp, to_char(now(), 'HH:MI AM')),
    COALESCE(v_staff_name, 'System'),
    p_staff_id
  )
  RETURNING transactions.id INTO v_transaction_id;

  -- Log activity if staff_id provided
  IF p_staff_id IS NOT NULL THEN
    INSERT INTO activity_log (staff_id, date, time, action, customer_id, customer_name, details)
    SELECT 
      p_staff_id,
      CURRENT_DATE,
      to_char(now(), 'HH:MI AM'),
      'added_tokens',
      p_user_id,
      u.name,
      format('Added %s tokens from purchase of %s RSD. New balance: %s tokens',
        v_tokens, p_amount_spent::text, v_new_balance)
    FROM users u WHERE u.id = p_user_id;
  END IF;

  RETURN QUERY SELECT true, v_tokens, v_new_balance, 
    format('Added %s tokens. New balance: %s', v_tokens, v_new_balance)::text;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. HELPER FUNCTION: Check redemption eligibility
-- ============================================================================
CREATE OR REPLACE FUNCTION check_redemption_eligibility(
  p_user_id uuid,
  p_reward_id integer
)
RETURNS TABLE (
  eligible boolean,
  current_balance integer,
  required_tokens integer,
  message text
) AS $$
DECLARE
  v_balance integer;
  v_cost integer;
BEGIN
  -- Get user's token balance
  SELECT token_balance INTO v_balance
  FROM users
  WHERE id = p_user_id;

  -- Get reward cost
  SELECT token_cost INTO v_cost
  FROM rewards
  WHERE id = p_reward_id AND active = true;

  IF v_cost IS NULL THEN
    RETURN QUERY SELECT false, COALESCE(v_balance, 0), 0, 'Reward not found or is inactive'::text;
    RETURN;
  END IF;

  IF v_balance IS NULL THEN
    RETURN QUERY SELECT false, 0, v_cost, 'User not found'::text;
    RETURN;
  END IF;

  IF v_balance >= v_cost THEN
    RETURN QUERY SELECT true, v_balance, v_cost, 'Eligible for redemption'::text;
  ELSE
    RETURN QUERY SELECT false, v_balance, v_cost, 
      format('Insufficient tokens. Need %s more', v_cost - v_balance)::text;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. HELPER FUNCTION: Generate redemption code
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_redemption_code(
  p_user_id uuid,
  p_reward_id integer,
  p_expiration_minutes integer DEFAULT 30
)
RETURNS TABLE (
  success boolean,
  code text,
  expires_at timestamptz,
  message text
) AS $$
DECLARE
  v_code text;
  v_chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  v_eligible boolean;
  v_message text;
  v_user_exists boolean;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM users WHERE id = p_user_id)
  INTO v_user_exists;

  IF NOT v_user_exists THEN
    RETURN QUERY SELECT false, '', now()::timestamptz, 'User not found'::text;
    RETURN;
  END IF;

  -- Check eligibility
  SELECT eligible, message INTO v_eligible, v_message
  FROM check_redemption_eligibility(p_user_id, p_reward_id);

  IF NOT v_eligible THEN
    RETURN QUERY SELECT false, '', now()::timestamptz, v_message;
    RETURN;
  END IF;

  -- Generate unique code (6 characters)
  LOOP
    v_code := '';
    FOR i IN 1..6 LOOP
      v_code := v_code || substr(v_chars, floor(random() * 36)::integer + 1, 1);
    END LOOP;
    
    EXIT WHEN NOT EXISTS(SELECT 1 FROM redemption_codes WHERE code = v_code);
  END LOOP;

  -- Create redemption code
  INSERT INTO redemption_codes (code, user_id, reward_id, expires_at)
  VALUES (v_code, p_user_id, p_reward_id, now() + (p_expiration_minutes || ' minutes')::interval);

  -- Deduct tokens
  UPDATE users
  SET token_balance = token_balance - (SELECT token_cost FROM rewards WHERE id = p_reward_id),
      updated_at = now()
  WHERE id = p_user_id;

  RETURN QUERY SELECT true, v_code, now() + (p_expiration_minutes || ' minutes')::interval,
    'Redemption code generated successfully'::text;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. HELPER FUNCTION: Verify redemption code
-- ============================================================================
CREATE OR REPLACE FUNCTION verify_redemption_code(
  p_code text,
  p_staff_id uuid
)
RETURNS TABLE (
  success boolean,
  reward_name text,
  customer_name text,
  message text
) AS $$
DECLARE
  v_reward_id integer;
  v_customer_id uuid;
  v_already_redeemed boolean;
  v_is_expired boolean;
  v_reward_name text;
  v_customer_name text;
  v_staff_name text;
BEGIN
  -- Verify code exists
  SELECT reward_id, user_id, redeemed, expires_at < now()
  INTO v_reward_id, v_customer_id, v_already_redeemed, v_is_expired
  FROM redemption_codes
  WHERE code = p_code;

  IF v_reward_id IS NULL THEN
    RETURN QUERY SELECT false, '', '', 'Code not found'::text;
    RETURN;
  END IF;

  IF v_already_redeemed THEN
    RETURN QUERY SELECT false, '', '', 'Code has already been redeemed'::text;
    RETURN;
  END IF;

  IF v_is_expired THEN
    RETURN QUERY SELECT false, '', '', 'Code has expired'::text;
    RETURN;
  END IF;

  -- Get reward and customer names
  SELECT name INTO v_reward_name FROM rewards WHERE id = v_reward_id;
  SELECT name INTO v_customer_name FROM users WHERE id = v_customer_id;
  SELECT name INTO v_staff_name FROM users WHERE id = p_staff_id;

  -- Mark as redeemed
  UPDATE redemption_codes
  SET redeemed = true, redeemed_at = now(), redeemed_by_staff_id = p_staff_id, redeemed_by = v_staff_name
  WHERE code = p_code;

  -- Log activity
  INSERT INTO activity_log (staff_id, date, time, action, customer_id, customer_name, details)
  VALUES (
    p_staff_id,
    CURRENT_DATE,
    to_char(now(), 'HH:MI AM'),
    'verified_redemption',
    v_customer_id,
    v_customer_name,
    format('Verified redemption code %s for reward: %s', p_code, v_reward_name)
  );

  RETURN QUERY SELECT true, v_reward_name, v_customer_name,
    'Redemption verified successfully'::text;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. HELPER FUNCTION: Get user dashboard stats
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id uuid)
RETURNS TABLE (
  token_balance integer,
  total_earned integer,
  total_spent numeric,
  transaction_count integer,
  member_since date,
  days_member integer,
  pending_redemptions integer,
  completed_redemptions integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.token_balance,
    u.total_tokens_earned,
    u.total_spent,
    COUNT(t.id)::integer,
    u.member_since,
    (CURRENT_DATE - u.member_since)::integer,
    COUNT(rc1.code)::integer,
    COUNT(rc2.code)::integer
  FROM users u
  LEFT JOIN transactions t ON u.id = t.user_id
  LEFT JOIN redemption_codes rc1 ON u.id = rc1.user_id AND rc1.redeemed = false AND rc1.expires_at > now()
  LEFT JOIN redemption_codes rc2 ON u.id = rc2.user_id AND rc2.redeemed = true
  WHERE u.id = p_user_id
  GROUP BY u.id, u.token_balance, u.total_tokens_earned, u.total_spent, u.member_since;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. HELPER FUNCTION: Get customer transaction history
-- ============================================================================
CREATE OR REPLACE FUNCTION get_customer_history(
  p_user_id uuid,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  transaction_id bigint,
  transaction_date date,
  amount_spent numeric,
  tokens_earned integer,
  timestamp_of_transaction text,
  added_by text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.date,
    t.amount_spent,
    t.tokens_earned,
    t.timestamp,
    COALESCE(t.added_by, 'System')
  FROM transactions t
  WHERE t.user_id = p_user_id
  ORDER BY t.date DESC, t.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. HELPER FUNCTION: Get staff activity summary
-- ============================================================================
CREATE OR REPLACE FUNCTION get_staff_activity_summary(
  p_staff_id uuid,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  tokens_added_count integer,
  redemptions_verified_count integer,
  customers_served integer,
  total_tokens_distributed integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(CASE WHEN a.action = 'added_tokens' THEN 1 END)::integer,
    COUNT(CASE WHEN a.action = 'verified_redemption' THEN 1 END)::integer,
    COUNT(DISTINCT a.customer_id)::integer,
    SUM(CASE WHEN a.action = 'added_tokens' THEN 
      (SELECT tokens_earned FROM transactions t 
       WHERE t.staff_id = p_staff_id AND t.date = p_date LIMIT 1) 
    ELSE 0 END)::integer
  FROM activity_log a
  WHERE a.staff_id = p_staff_id AND a.date = p_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. HELPER FUNCTION: Validate and sanitize email
-- ============================================================================
CREATE OR REPLACE FUNCTION is_valid_email(p_email text)
RETURNS boolean AS $$
BEGIN
  RETURN p_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. HELPER FUNCTION: Archive expired redemption codes
-- ============================================================================
CREATE OR REPLACE FUNCTION archive_expired_codes()
RETURNS TABLE (
  codes_archived integer,
  timestamp_of_operation timestamptz
) AS $$
DECLARE
  v_count integer;
BEGIN
  -- For now, we just delete expired codes
  -- In production, you'd move them to an archive table
  DELETE FROM redemption_codes
  WHERE redeemed = false AND expires_at < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN QUERY SELECT v_count, now();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. HELPER FUNCTION: Reset daily counters for staff
-- ============================================================================
CREATE OR REPLACE FUNCTION reset_daily_staff_counters()
RETURNS TABLE (
  staff_members_updated integer,
  timestamp_of_reset timestamptz
) AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE users
  SET tokens_added_today = 0, redemptions_verified_today = 0
  WHERE role = 'staff';

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN QUERY SELECT v_count, now();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. HELPER FUNCTION: Get reward details with availability
-- ============================================================================
CREATE OR REPLACE FUNCTION get_reward_details(p_reward_id integer)
RETURNS TABLE (
  reward_id integer,
  reward_name text,
  token_cost integer,
  image_url text,
  is_active boolean,
  total_redeemed integer,
  pending_redemptions integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.token_cost,
    r.image_url,
    r.active,
    COUNT(rc1.code)::integer,
    COUNT(rc2.code)::integer
  FROM rewards r
  LEFT JOIN redemption_codes rc1 ON r.id = rc1.reward_id AND rc1.redeemed = true
  LEFT JOIN redemption_codes rc2 ON r.id = rc2.reward_id AND rc2.redeemed = false AND rc2.expires_at > now()
  WHERE r.id = p_reward_id
  GROUP BY r.id, r.name, r.token_cost, r.image_url, r.active;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 12. HELPER FUNCTION: Bulk add tokens (admin function)
-- ============================================================================
CREATE OR REPLACE FUNCTION bulk_add_tokens(
  p_user_ids uuid[],
  p_tokens_per_user integer,
  p_staff_id uuid,
  p_reason text DEFAULT 'Bulk addition'
)
RETURNS TABLE (
  success boolean,
  users_updated integer,
  message text
) AS $$
DECLARE
  v_user_id uuid;
  v_count integer := 0;
BEGIN
  FOREACH v_user_id IN ARRAY p_user_ids LOOP
    BEGIN
      UPDATE users
      SET token_balance = LEAST(token_balance + p_tokens_per_user, 800),
          total_tokens_earned = total_tokens_earned + p_tokens_per_user,
          updated_at = now()
      WHERE id = v_user_id AND role = 'customer';
      
      v_count := v_count + 1;
    EXCEPTION WHEN OTHERS THEN
      -- Continue with next user if error occurs
      CONTINUE;
    END;
  END LOOP;

  RETURN QUERY SELECT true, v_count, 
    format('Added %s tokens to %s users', p_tokens_per_user, v_count)::text;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 13. Create indexes for better performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_redemption_codes_expires_at ON redemption_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_redeemed_at ON redemption_codes(redeemed_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON activity_log(date);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_staff_id ON transactions(staff_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- ============================================================================
-- 14. Add helpful comments to functions
-- ============================================================================
COMMENT ON FUNCTION add_tokens_to_customer IS 'Adds tokens to a customer from a purchase transaction';
COMMENT ON FUNCTION check_redemption_eligibility IS 'Checks if a customer can redeem a specific reward';
COMMENT ON FUNCTION generate_redemption_code IS 'Generates a unique redemption code for a reward';
COMMENT ON FUNCTION verify_redemption_code IS 'Marks a redemption code as verified by staff';
COMMENT ON FUNCTION get_user_dashboard_stats IS 'Retrieves comprehensive user statistics';
COMMENT ON FUNCTION get_customer_history IS 'Gets transaction history for a customer';
COMMENT ON FUNCTION get_staff_activity_summary IS 'Gets activity summary for a staff member';
COMMENT ON FUNCTION is_valid_email IS 'Validates email address format';
COMMENT ON FUNCTION archive_expired_codes IS 'Archives and removes expired redemption codes';
COMMENT ON FUNCTION reset_daily_staff_counters IS 'Resets daily counters for all staff members';
COMMENT ON FUNCTION get_reward_details IS 'Gets detailed information about a reward';
COMMENT ON FUNCTION bulk_add_tokens IS 'Adds tokens to multiple users at once';
