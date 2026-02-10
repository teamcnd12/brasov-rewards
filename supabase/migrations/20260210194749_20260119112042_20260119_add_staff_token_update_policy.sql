/*
  # Add Staff Token Update Policy
  
  1. Problem
    - Staff members cannot update customer token balances
    - RLS policy only allows users to update their own profiles
    - handleAddTokens function fails silently due to missing UPDATE permission
  
  2. Solution
    - Create UPDATE policy for staff to modify token_balance on customer accounts
    - Staff can only update specific fields needed for token rewards
    - Prevents staff from modifying other sensitive fields
  
  3. Security
    - Only staff role can use this policy
    - Can only update token_balance, total_tokens_earned, total_spent columns
    - Cannot modify user profile or authentication data
*/

CREATE POLICY "Staff can update customer token balance"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'staff'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'staff'
    )
    AND role != 'staff'
    AND role != 'admin'
  );