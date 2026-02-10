/*
  # Fix Staff Token Update Policy
  
  1. Problem
    - Previous policy checked u.id = auth.uid()
    - Should check u.auth_user_id = auth.uid()
    - auth.uid() returns the Supabase auth user ID, not the database user id
  
  2. Solution
    - Drop incorrect policy
    - Create corrected policy using auth_user_id field
  
  3. Security
    - Only authenticated staff can update customer token balances
    - Cannot update other staff or admin accounts
*/

DROP POLICY IF EXISTS "Staff can update customer token balance" ON users;

CREATE POLICY "Staff can update customer token balance"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.role = 'staff'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.role = 'staff'
    )
    AND role != 'staff'
    AND role != 'admin'
  );