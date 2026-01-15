-- Supabase SQL Schema for LibLog

-- Create profiles table (links to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create logs table
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create friendships table (self-referential join)
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create indexes for performance
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_date ON logs(date);
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can view their own profile and friends' profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view friends' profiles"
  ON profiles
  FOR SELECT
  USING (
    id IN (
      SELECT friend_id FROM friendships
      WHERE user_id = auth.uid() AND status = 'accepted'
      UNION
      SELECT user_id FROM friendships
      WHERE friend_id = auth.uid() AND status = 'accepted'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for logs
-- Users can only view/edit their own logs
CREATE POLICY "Users can view own logs"
  ON logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for friendships
-- Users can view their own friendships
CREATE POLICY "Users can view own friendships"
  ON friendships
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friendship requests
CREATE POLICY "Users can create friendship requests"
  ON friendships
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can accept/reject requests sent to them
CREATE POLICY "Users can update friendship requests"
  ON friendships
  FOR UPDATE
  USING (auth.uid() = friend_id)
  WITH CHECK (auth.uid() = friend_id);

-- Users can delete their own friendships
CREATE POLICY "Users can delete friendships"
  ON friendships
  FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create trigger to auto-create profile on auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_logs_timestamp
BEFORE UPDATE ON logs
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
