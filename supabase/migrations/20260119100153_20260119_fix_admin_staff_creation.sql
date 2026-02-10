/*
  # Fix Admin Staff Creation

  1. Changes
    - Add INSERT policy for admins to create staff user records
    - Allow admins to insert into users table for staff creation
    
  2. Security
    - Only admins can insert staff records
    - Enforces role='staff' in policy
*/

CREATE POLICY "Admins can create staff users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    AND role = 'staff'
  );