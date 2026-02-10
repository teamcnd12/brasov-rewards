/*
  # Add Maximum Token Limit Constraint

  1. New Constraint
    - `token_balance` in `users` table now has a maximum limit of 800
    - Users cannot accumulate more than 800 stars/tokens
    - This constraint is enforced at the database level to prevent overfilling accounts

  2. Modifications
    - Added CHECK constraint to `token_balance` column to ensure value <= 800
    - Constraint applies to all customer accounts

  3. Important Notes
    - Existing accounts with more than 800 tokens will need to be handled separately if applicable
    - Staff adding tokens should be prevented from exceeding this limit via application logic
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'users' AND constraint_name = 'check_max_token_balance'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT check_max_token_balance CHECK (token_balance <= 800);
  END IF;
END $$;
