-- Migration: Add nested comments with voting support
-- This migration enables nested/reply comments on answers with upvote/downvote functionality

-- Step 1: Add fields to existing comments table for nesting and vote tracking
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS path TEXT DEFAULT '';

-- Step 2: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments(parent_id);
CREATE INDEX IF NOT EXISTS comments_answer_id_idx ON comments(answer_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);

-- Step 3: Extend votes table to support comment voting
-- Add check constraint to validate target_type includes 'comment'
ALTER TABLE votes 
DROP CONSTRAINT IF EXISTS valid_target_type;

ALTER TABLE votes 
ADD CONSTRAINT valid_target_type 
CHECK (target_type IN ('question', 'answer', 'comment'));

-- Update comment on the column
COMMENT ON COLUMN votes.target_type IS 'Type of target: question, answer, or comment';

-- Step 4: Create recursive query function for efficient nested comment retrieval
CREATE OR REPLACE FUNCTION get_comment_tree(p_answer_id UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  user_id UUID,
  parent_id UUID,
  upvotes INTEGER,
  downvotes INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  depth INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE comment_tree AS (
    -- Base case: top-level comments
    SELECT 
      c.id, c.content, c.user_id, c.parent_id, 
      c.upvotes, c.downvotes, c.created_at, c.updated_at,
      0 as depth
    FROM comments c
    WHERE c.answer_id = p_answer_id AND c.parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child comments
    SELECT 
      c.id, c.content, c.user_id, c.parent_id,
      c.upvotes, c.downvotes, c.created_at, c.updated_at,
      ct.depth + 1
    FROM comments c
    INNER JOIN comment_tree ct ON c.parent_id = ct.id
  )
  SELECT * FROM comment_tree ORDER BY created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create function to update comment vote counts automatically
CREATE OR REPLACE FUNCTION update_comment_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
  v_target_id UUID;
  v_target_type TEXT;
BEGIN
  -- Determine target_id and target_type based on operation
  IF TG_OP = 'DELETE' THEN
    v_target_id := OLD.target_id;
    v_target_type := OLD.target_type;
  ELSE
    v_target_id := NEW.target_id;
    v_target_type := NEW.target_type;
  END IF;

  -- Only update if target_type is 'comment'
  IF v_target_type = 'comment' THEN
    UPDATE comments
    SET 
      upvotes = (SELECT COUNT(*) FROM votes WHERE target_id = v_target_id AND target_type = 'comment' AND value = 1),
      downvotes = (SELECT COUNT(*) FROM votes WHERE target_id = v_target_id AND target_type = 'comment' AND value = -1)
    WHERE id = v_target_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 6: Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_update_comment_votes ON votes;

CREATE TRIGGER trigger_update_comment_votes
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_comment_vote_counts();

-- Step 7: Enable Row Level Security on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Step 8: Drop existing policies if they exist
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Step 9: Create RLS policies for comments
-- Read: Anyone can read comments
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT
USING (true);

-- Insert: Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Update: Users can update their own comments
CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id);

-- Delete: Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);

-- Step 10: Add comments to table documentation
COMMENT ON TABLE comments IS 'Stores comments on answers with support for nested replies and voting';
COMMENT ON COLUMN comments.parent_id IS 'ID of parent comment for nested replies (null for top-level comments)';
COMMENT ON COLUMN comments.upvotes IS 'Count of upvotes on this comment';
COMMENT ON COLUMN comments.downvotes IS 'Count of downvotes on this comment';
COMMENT ON COLUMN comments.path IS 'Materialized path for efficient hierarchical queries (optional for future optimization)';
