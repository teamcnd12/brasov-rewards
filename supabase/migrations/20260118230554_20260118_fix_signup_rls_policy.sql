/*
  # Fix RLS Policy for User Signup

  1. Issue
    - Missing INSERT policy on users table preventing account creation
    - SignUp was failing because authenticated users couldn't insert their own profile records

  2. Changes
    - Add INSERT policy to allow authenticated users to create their own profile
    - Policy ensures users can only insert records where auth_user_id matches their own auth.uid()
    
  3. Security
    - INSERT policy strictly checks that auth_user_id matches the authenticated user's ID
    - Prevents users from creating profiles for other users
*/

CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());
