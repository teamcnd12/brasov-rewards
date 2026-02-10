/*
  # Coffee Rewards App Database Schema

  ## Overview
  Creates a complete database schema for the Coffee Rewards loyalty program with role-based access control.

  ## Tables Created

  ### 1. users
  Stores both customer and staff accounts with role-based fields
  - `id` (uuid, primary key)
  - `user_id` (text, unique) - Custom user ID (e.g., USER123, STAFF001)
  - `name` (text) - Full name
  - `email` (text, unique) - Email address
  - `phone` (text) - Phone number
  - `password` (text) - Password (plain text for demo)
  - `role` (text) - 'customer' or 'staff'
  - `token_balance` (integer) - Current token balance (customers only)
  - `total_tokens_earned` (integer) - Lifetime tokens earned (customers)
  - `total_spent` (numeric) - Total amount spent (customers)
  - `member_since` (date) - Account creation date
  - `employee_id` (text) - Employee ID (staff only)
  - `created_by` (text) - Who created the account (staff only)
  - `tokens_added_today` (integer) - Daily counter (staff only)
  - `redemptions_verified_today` (integer) - Daily counter (staff only)

  ### 2. transactions
  Records all customer purchase transactions
  - `id` (bigint, primary key)
  - `user_id` (uuid) - References users table
  - `date` (date) - Transaction date
  - `amount_spent` (numeric) - Purchase amount in RSD
  - `tokens_earned` (integer) - Tokens earned from purchase
  - `timestamp` (text) - Time of transaction or "Welcome Bonus"
  - `added_by` (text) - Staff member name who recorded transaction
  - `staff_id` (uuid) - References users table (staff)

  ### 3. rewards
  Available rewards that customers can redeem
  - `id` (integer, primary key)
  - `name` (text) - Reward name
  - `token_cost` (integer) - Cost in tokens
  - `image_url` (text) - Image identifier
  - `active` (boolean) - Whether reward is available

  ### 4. redemption_codes
  Generated codes for reward redemption
  - `code` (text, primary key)
  - `user_id` (uuid) - Customer who redeemed
  - `reward_id` (integer) - Reward being redeemed
  - `expires_at` (timestamptz) - Expiration time
  - `redeemed` (boolean) - Whether code has been used
  - `created_at` (timestamptz) - When code was generated
  - `redeemed_at` (timestamptz) - When code was verified
  - `redeemed_by` (text) - Staff member who verified
  - `redeemed_by_staff_id` (uuid) - Staff member ID

  ### 5. activity_log
  Logs all staff actions for tracking
  - `id` (bigint, primary key)
  - `staff_id` (uuid) - Staff member performing action
  - `date` (date) - Action date
  - `time` (text) - Action time
  - `action` (text) - 'added_tokens' or 'verified_redemption'
  - `customer_id` (uuid) - Customer affected
  - `customer_name` (text) - Customer name
  - `details` (text) - Action details

  ## Security
  - RLS enabled on all tables
  - Customers can read/update only their own data
  - Staff can read customer data and create transactions
  - Staff can verify redemption codes
  - Activity logs are read-only for staff

  ## Initial Data
  - 4 rewards seeded (pastry, coffee, specialty drink, sandwich)
  - 1 test customer account (customer@test.com / customer123)
  - 1 test staff account (staff@test.com / staff123)
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('customer', 'staff')),
  token_balance integer DEFAULT 0,
  total_tokens_earned integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  member_since date NOT NULL DEFAULT CURRENT_DATE,
  employee_id text,
  created_by text,
  tokens_added_today integer DEFAULT 0,
  redemptions_verified_today integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount_spent numeric NOT NULL,
  tokens_earned integer NOT NULL,
  timestamp text NOT NULL,
  added_by text,
  staff_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id integer PRIMARY KEY,
  name text NOT NULL,
  token_cost integer NOT NULL,
  image_url text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create redemption_codes table
CREATE TABLE IF NOT EXISTS redemption_codes (
  code text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id integer NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  redeemed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  redeemed_at timestamptz,
  redeemed_by text,
  redeemed_by_staff_id uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id bigserial PRIMARY KEY,
  staff_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  time text NOT NULL,
  action text NOT NULL CHECK (action IN ('added_tokens', 'verified_redemption')),
  customer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  customer_name text,
  details text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_user_id ON redemption_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_redeemed ON redemption_codes(redeemed);
CREATE INDEX IF NOT EXISTS idx_activity_log_staff_id ON activity_log(staff_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemption_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Staff can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'staff'
    )
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for transactions table
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff can read all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'staff'
    )
  );

CREATE POLICY "Staff can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'staff'
    )
  );

-- RLS Policies for rewards table (public read)
CREATE POLICY "Anyone can read rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (active = true);

-- RLS Policies for redemption_codes table
CREATE POLICY "Users can read own redemption codes"
  ON redemption_codes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff can read all redemption codes"
  ON redemption_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'staff'
    )
  );

CREATE POLICY "Users can create redemption codes"
  ON redemption_codes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can update redemption codes"
  ON redemption_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'staff'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'staff'
    )
  );

-- RLS Policies for activity_log table
CREATE POLICY "Staff can read own activity log"
  ON activity_log FOR SELECT
  TO authenticated
  USING (staff_id = auth.uid());

CREATE POLICY "Staff can create activity log entries"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (staff_id = auth.uid());

-- Insert initial rewards
INSERT INTO rewards (id, name, token_cost, image_url, active) VALUES
  (1, 'Kafa po izboru', 150, 'unsplash-pastry', true),
  (2, 'Kolač po izboru', 250, 'unsplash-coffee', true),
  (3, 'Koktel po izboru', 350, 'unsplash-latte', true),
  (4, 'Salto točeno pivo', 200, 'unsplash-sandwich', true)
ON CONFLICT (id) DO NOTHING;

-- Insert test customer account
INSERT INTO users (
  user_id, name, email, phone, password, role,
  token_balance, total_tokens_earned, total_spent, member_since
) VALUES (
  'USER123', 'John Doe', 'customer@test.com', '(555) 123-4567',
  'customer123', 'customer', 156, 456, 2340, '2024-12-15'
) ON CONFLICT (email) DO NOTHING;

-- Insert test staff account
INSERT INTO users (
  user_id, name, email, phone, password, role,
  employee_id, created_by, tokens_added_today, redemptions_verified_today, member_since
) VALUES (
  'STAFF001', 'Staff Demo', 'staff@test.com', '(555) 555-5555',
  'staff123', 'staff', 'DEMO01', 'admin', 0, 0, '2024-10-01'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample transactions for test customer
INSERT INTO transactions (user_id, date, amount_spent, tokens_earned, timestamp)
SELECT 
  id, '2024-01-05', 250, 25, '10:30 AM'
FROM users WHERE email = 'customer@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO transactions (user_id, date, amount_spent, tokens_earned, timestamp)
SELECT 
  id, '2024-01-04', 180, 18, '2:15 PM'
FROM users WHERE email = 'customer@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO transactions (user_id, date, amount_spent, tokens_earned, timestamp)
SELECT 
  id, '2024-01-03', 450, 45, '9:00 AM'
FROM users WHERE email = 'customer@test.com'
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();