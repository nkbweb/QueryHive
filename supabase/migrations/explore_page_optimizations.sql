-- Migration for Explore Page optimizations
-- This adds performance indexes and denormalized columns for efficient explore page queries

-- Add answer_count column to questions table for faster unanswered queries
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS answer_count INTEGER DEFAULT 0;

-- Add trending_score column for algorithm-based trending (optional, can be calculated later)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS trending_score INTEGER DEFAULT 0;

-- Create indexes for performance

-- Index for trending questions (upvotes + recency)
CREATE INDEX IF NOT EXISTS idx_questions_trending 
ON public.questions(upvotes DESC, created_at DESC);

-- Index for recent questions
CREATE INDEX IF NOT EXISTS idx_questions_recent 
ON public.questions(created_at DESC);

-- Index for most viewed questions
CREATE INDEX IF NOT EXISTS idx_questions_most_viewed 
ON public.questions(views DESC);

-- Index for unanswered questions (composite index for better performance)
CREATE INDEX IF NOT EXISTS idx_questions_unanswered 
ON public.questions(created_at DESC, answer_count ASC)
WHERE answer_count = 0;

-- Index for popular tags
CREATE INDEX IF NOT EXISTS idx_tags_popular 
ON public.tags(question_count DESC, name ASC);

-- Index for top contributors
CREATE INDEX IF NOT EXISTS idx_users_top_contributors 
ON public.users(reputation DESC, created_at DESC);

-- Index for question-tag lookups (for filtering by tag)
CREATE INDEX IF NOT EXISTS idx_question_tags_tag_id 
ON public.question_tags(tag_id, question_id);

-- Index for question-tag lookups (reverse)
CREATE INDEX IF NOT EXISTS idx_question_tags_question_id 
ON public.question_tags(question_id, tag_id);

-- Create function to update answer_count when answers change
CREATE OR REPLACE FUNCTION public.update_question_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment answer count when answer is inserted
    UPDATE public.questions 
    SET answer_count = answer_count + 1,
        updated_at = NOW()
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement answer count when answer is deleted
    UPDATE public.questions 
    SET answer_count = GREATEST(answer_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.question_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If question_id changed, update both old and new
    IF OLD.question_id != NEW.question_id THEN
      UPDATE public.questions 
      SET answer_count = GREATEST(answer_count - 1, 0),
          updated_at = NOW()
      WHERE id = OLD.question_id;
      
      UPDATE public.questions 
      SET answer_count = answer_count + 1,
          updated_at = NOW()
      WHERE id = NEW.question_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for answer_count updates
DROP TRIGGER IF EXISTS trigger_update_answer_count_insert ON public.answers;
CREATE TRIGGER trigger_update_answer_count_insert
AFTER INSERT ON public.answers
FOR EACH ROW
EXECUTE FUNCTION public.update_question_answer_count();

DROP TRIGGER IF EXISTS trigger_update_answer_count_delete ON public.answers;
CREATE TRIGGER trigger_update_answer_count_delete
AFTER DELETE ON public.answers
FOR EACH ROW
EXECUTE FUNCTION public.update_question_answer_count();

DROP TRIGGER IF EXISTS trigger_update_answer_count_update ON public.answers;
CREATE TRIGGER trigger_update_answer_count_update
AFTER UPDATE ON public.answers
FOR EACH ROW
WHEN (OLD.question_id IS DISTINCT FROM NEW.question_id)
EXECUTE FUNCTION public.update_question_answer_count();

-- Backfill answer_count for existing questions
UPDATE public.questions q
SET answer_count = (
  SELECT COUNT(*)
  FROM public.answers a
  WHERE a.question_id = q.id
);

-- Create function to update tag question_count
CREATE OR REPLACE FUNCTION public.update_tag_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment tag question count
    UPDATE public.tags 
    SET question_count = question_count + 1
    WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement tag question count
    UPDATE public.tags 
    SET question_count = GREATEST(question_count - 1, 0)
    WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tag question_count updates
DROP TRIGGER IF EXISTS trigger_update_tag_count_insert ON public.question_tags;
CREATE TRIGGER trigger_update_tag_count_insert
AFTER INSERT ON public.question_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_tag_question_count();

DROP TRIGGER IF EXISTS trigger_update_tag_count_delete ON public.question_tags;
CREATE TRIGGER trigger_update_tag_count_delete
AFTER DELETE ON public.question_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_tag_question_count();

-- Backfill tag question_count for existing tags
UPDATE public.tags t
SET question_count = (
  SELECT COUNT(*)
  FROM public.question_tags qt
  WHERE qt.tag_id = t.id
);

-- Create function to update trending_score periodically
-- This can be called by a cron job or scheduled task
-- Formula: (upvotes * 2) + views + (answer_count * 3) - time_decay
CREATE OR REPLACE FUNCTION public.calculate_trending_score()
RETURNS VOID AS $$
BEGIN
  UPDATE public.questions
  SET trending_score = (
    (upvotes * 2) + 
    views + 
    (answer_count * 3) - 
    EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 -- Decay by days
  );
END;
$$ LANGUAGE plpgsql;

-- Initial calculation of trending scores
SELECT public.calculate_trending_score();

-- Add comments for documentation
COMMENT ON COLUMN public.questions.answer_count IS 'Denormalized count of answers for performance. Updated by triggers.';
COMMENT ON COLUMN public.questions.trending_score IS 'Calculated score for trending questions. Higher = more trending. Updated periodically.';
COMMENT ON INDEX idx_questions_trending IS 'Index for trending queries (upvotes + recency)';
COMMENT ON INDEX idx_questions_recent IS 'Index for recent questions queries';
COMMENT ON INDEX idx_questions_most_viewed IS 'Index for most viewed questions queries';
COMMENT ON INDEX idx_questions_unanswered IS 'Partial index for unanswered questions (answer_count = 0)';
COMMENT ON INDEX idx_tags_popular IS 'Index for popular tags queries';
COMMENT ON INDEX idx_users_top_contributors IS 'Index for top contributors queries';
COMMENT ON INDEX idx_question_tags_tag_id IS 'Index for filtering questions by tag';
COMMENT ON INDEX idx_question_tags_question_id IS 'Index for getting tags for a question';
