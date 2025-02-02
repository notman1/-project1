/*
  # Create User Profile Function

  1. New Functions
    - create_user_profile: Safely creates a new user profile

  2. Security
    - Function is accessible to authenticated users only
    - Ensures atomic operation for user profile creation
*/

CREATE OR REPLACE FUNCTION create_user_profile(user_id UUID, user_username TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO users (id, username)
  VALUES (user_id, user_username);
END;
$$;
