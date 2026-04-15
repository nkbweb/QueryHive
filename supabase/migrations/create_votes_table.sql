-- Create votes table for proper vote tracking
-- This replaces the metadata-based vote system with a proper database table

CREATE TABLE IF NOT EXISTS public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid (),
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL, -- 'question' or 'answer'
  target_id UUID NOT NULL, -- question_id or answer_id
  value INTEGER NOT NULL, -- 1 for upvote, -1 for downvote, 0 for no vote
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT votes_pkey PRIMARY KEY (id),
  CONSTRAINT unique_vote_per_user UNIQUE (user_id, target_type, target_id),
  CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS votes_target_idx ON public.votes (target_type, target_id);
CREATE INDEX IF NOT EXISTS votes_user_idx ON public.votes (user_id);

-- Comments
COMMENT ON TABLE public.votes IS 'Tracks user votes on questions and answers';
COMMENT ON COLUMN public.votes.target_type IS 'Type of target: question or answer';
COMMENT ON COLUMN public.votes.target_id IS 'ID of the target question or answer';
COMMENT ON COLUMN public.votes.value IS 'Vote value: 1 (upvote), -1 (downvote), 0 (no vote)';
