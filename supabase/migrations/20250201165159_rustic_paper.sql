/*
  # Fix Users Table RLS Policies

  1. Changes
    - Add policy to allow inserting new users during signup
    - Update existing policies for better security

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Inserting new users (authenticated only)
      - Reading user profiles (authenticated only)
      - Updating own profile (authenticated only)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users only"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable update for users based on id"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
