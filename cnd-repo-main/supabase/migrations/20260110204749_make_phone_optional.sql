/*
  # Make phone number optional

  1. Changes
    - Make phone column nullable in users table
    - Users can sign up without providing phone number
*/

-- Make phone nullable
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
