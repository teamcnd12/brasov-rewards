/*
  # Add Admin Role Support

  1. Changes
    - Drop the existing role check constraint
    - Add new constraint that includes 'admin' as a valid role
    - Promote first registered user to admin role
  
  2. Security
    - Maintains role validation with admin support
    - Ensures at least one admin exists in the system
*/

-- Drop the existing role check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint that includes admin role
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('customer', 'staff', 'admin'));

-- Promote the first user with an auth_user_id to admin role
UPDATE users
SET role = 'admin'
WHERE auth_user_id IS NOT NULL
  AND auth_user_id = (
    SELECT auth_user_id 
    FROM users 
    WHERE auth_user_id IS NOT NULL 
    ORDER BY created_at ASC 
    LIMIT 1
  );
