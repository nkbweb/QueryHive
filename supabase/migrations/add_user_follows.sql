-- User Follow System Migration
-- This migration adds support for user-to-user follow relationships

-- Create user_follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at DESC);

-- Add follower/following count columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Initialize counts for existing profiles
UPDATE profiles 
SET followers_count = 0, 
    following_count = 0 
WHERE followers_count IS NULL OR following_count IS NULL;

-- Create function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for follower count updates
DROP TRIGGER IF EXISTS trigger_update_follower_counts_insert ON user_follows;
CREATE TRIGGER trigger_update_follower_counts_insert
AFTER INSERT ON user_follows
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts();

DROP TRIGGER IF EXISTS trigger_update_follower_counts_delete ON user_follows;
CREATE TRIGGER trigger_update_follower_counts_delete
AFTER DELETE ON user_follows
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts();

-- Enable Row Level Security for user_follows
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_follows
-- Users can view all follow relationships (public read access)
CREATE POLICY "Follow relationships are viewable by everyone" 
ON user_follows FOR SELECT 
USING (true);

-- Users can insert their own follow relationships
CREATE POLICY "Users can create own follow relationships" 
ON user_follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follow relationships
CREATE POLICY "Users can delete own follow relationships" 
ON user_follows FOR DELETE 
USING (auth.uid() = follower_id);

-- Grant necessary permissions
GRANT ALL ON user_follows TO authenticated;
GRANT SELECT ON user_follows TO anon;
