/*
  # Initial Forum Schema Setup

  1. New Tables
    - users (extends auth.users)
      - id (uuid, primary key)
      - username (text)
      - is_admin (boolean)
      - created_at (timestamp)
    - forums
      - id (uuid, primary key)
      - title (text)
      - content (text)
      - user_id (uuid, foreign key)
      - status (text)
      - tags (text[])
      - likes_count (integer)
      - created_at (timestamp)
    - replies
      - id (uuid, primary key)
      - content (text)
      - forum_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - likes_count (integer)
      - created_at (timestamp)
    - likes
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - target_id (uuid)
      - target_type (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table extending auth.users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Forums table
CREATE TABLE IF NOT EXISTS forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  status text DEFAULT 'open',
  tags text[] DEFAULT '{}',
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Replies table
CREATE TABLE IF NOT EXISTS replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  forum_id uuid REFERENCES forums(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  target_id uuid NOT NULL,
  target_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_id, target_type)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Forums policies
CREATE POLICY "Anyone can read forums"
  ON forums FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create forums"
  ON forums FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forums"
  ON forums FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR 
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND is_admin = true
        ));

-- Replies policies
CREATE POLICY "Anyone can read replies"
  ON replies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies"
  ON replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR 
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND is_admin = true
        ));

-- Likes policies
CREATE POLICY "Anyone can read likes"
  ON likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);
