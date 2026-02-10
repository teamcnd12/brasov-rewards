/*
  # Add Last Visits (Poslednje posete) Tracking Table

  1. New Table
    - `poslednje_posete` - Tracks customer visit/transaction history for UI display
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (text) - Type of visit/transaction (e.g., 'Poklon dobrodošlice', 'Kupovina', 'Iskupljavanje')
      - `title` (text) - Display title
      - `date` (date) - Date of visit/transaction
      - `timestamp` (text) - Time of visit/transaction
      - `created_at` (timestamptz) - Record creation time

  2. Security
    - Enable RLS on `poslednje_posete` table
    - Customers can only read their own last visits
    - Staff can read all customer last visits
*/

CREATE TABLE IF NOT EXISTS poslednje_posete (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  timestamp text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_poslednje_posete_user_id ON poslednje_posete(user_id);
CREATE INDEX IF NOT EXISTS idx_poslednje_posete_date ON poslednje_posete(date DESC);

ALTER TABLE poslednje_posete ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own last visits"
  ON poslednje_posete FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff can read all customer last visits"
  ON poslednje_posete FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'staff'
    )
  );

CREATE POLICY "System can insert last visits"
  ON poslednje_posete FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE poslednje_posete IS 'Last visits and transactions for customers - used for displaying recent activity';