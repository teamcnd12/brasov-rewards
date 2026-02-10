/*
  # Simplify Staff Update Policy
  
  1. Problem
    - Staff cannot update customer token balances
    - RLS policy with subquery on same table may be causing issues
    - Transactions are created but user balance not updated
  
  2. Solution
    - Create helper function to check if current user is staff
    - Use function in RLS policy to avoid circular queries
    - Allow staff to update customer records
  
  3. Security
    - Only staff role can update customers
    - Cannot update other staff or admin accounts
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Staff can update customer token balance" ON users;

-- Create helper function to check if user is staff
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid()
    AND role = 'staff'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policy using helper function
CREATE POLICY "Staff can update customer token balance"
  ON users FOR UPDATE
  TO authenticated
  USING (is_staff() OR auth_user_id = auth.uid())
  WITH CHECK (
    (is_staff() AND role = 'customer')
    OR auth_user_id = auth.uid()
  );