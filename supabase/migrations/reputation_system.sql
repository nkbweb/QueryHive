-- Reputation System Migration
-- This adds automatic reputation calculation based on user actions

-- Reputation points configuration
-- Question upvote: +10
-- Answer upvote: +15
-- Downvote received: -2
-- Answer verification: +2

-- Function to update user reputation when a vote is cast
CREATE OR REPLACE FUNCTION public.update_reputation_on_vote()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  reputation_change INTEGER;
BEGIN
  -- Log trigger execution
  RAISE NOTICE 'Trigger fired: target_type=%, target_id=%, value=%', NEW.target_type, NEW.target_id, NEW.value;

  -- Determine the target user (the owner of the question/answer)
  IF NEW.target_type = 'question' THEN
    SELECT user_id INTO target_user_id FROM public.questions WHERE id = NEW.target_id;
  ELSIF NEW.target_type = 'answer' THEN
    SELECT user_id INTO target_user_id FROM public.answers WHERE id = NEW.target_id;
  ELSE
    RAISE NOTICE 'Unknown target_type, returning';
    RETURN NEW;
  END IF;

  -- Log target user
  RAISE NOTICE 'Target user_id: %', target_user_id;

  -- If no target user found, return
  IF target_user_id IS NULL THEN
    RAISE NOTICE 'Target user_id is NULL, returning';
    RETURN NEW;
  END IF;

  -- Calculate reputation change
  IF NEW.value = 1 THEN
    -- Upvote
    IF NEW.target_type = 'question' THEN
      reputation_change := 10;
    ELSE
      reputation_change := 15;
    END IF;
  ELSIF NEW.value = -1 THEN
    -- Downvote received
    reputation_change := -2;
  ELSE
    -- Vote removed (value = 0), need to reverse previous vote
    IF OLD.value = 1 THEN
      IF OLD.target_type = 'question' THEN
        reputation_change := -10;
      ELSE
        reputation_change := -15;
      END IF;
    ELSIF OLD.value = -1 THEN
      reputation_change := 2;
    ELSE
      reputation_change := 0;
    END IF;
  END IF;

  -- Log reputation change
  RAISE NOTICE 'Reputation change: %', reputation_change;

  -- Update user reputation
  IF reputation_change != 0 THEN
    UPDATE public.profiles
    SET reputation = GREATEST(reputation + reputation_change, 0)
    WHERE id = target_user_id;

    RAISE NOTICE 'Updated reputation for user %', target_user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for votes
DROP TRIGGER IF EXISTS trigger_reputation_vote_insert ON public.votes;
CREATE TRIGGER trigger_reputation_vote_insert
AFTER INSERT ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_reputation_on_vote();

DROP TRIGGER IF EXISTS trigger_reputation_vote_update ON public.votes;
CREATE TRIGGER trigger_reputation_vote_update
AFTER UPDATE ON public.votes
FOR EACH ROW
WHEN (OLD.value IS DISTINCT FROM NEW.value)
EXECUTE FUNCTION public.update_reputation_on_vote();

DROP TRIGGER IF EXISTS trigger_reputation_vote_delete ON public.votes;
CREATE TRIGGER trigger_reputation_vote_delete
AFTER DELETE ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_reputation_on_vote();

-- Function to update reputation when answer is verified
CREATE OR REPLACE FUNCTION public.update_reputation_on_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- If verification_count increased, add reputation
  IF NEW.verification_count > OLD.verification_count THEN
    UPDATE public.profiles
    SET reputation = reputation + 2
    WHERE id = NEW.user_id;
  ELSIF NEW.verification_count < OLD.verification_count THEN
    -- If verification decreased (unlikely but possible), remove reputation
    UPDATE public.profiles
    SET reputation = GREATEST(reputation - 2, 0)
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for answer verification
DROP TRIGGER IF EXISTS trigger_reputation_verification ON public.answers;
CREATE TRIGGER trigger_reputation_verification
AFTER UPDATE ON public.answers
FOR EACH ROW
WHEN (OLD.verification_count IS DISTINCT FROM NEW.verification_count)
EXECUTE FUNCTION public.update_reputation_on_verification();

-- Function to recalculate reputation for a user (for manual fixes)
CREATE OR REPLACE FUNCTION public.recalculate_user_reputation(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_reputation INTEGER;
BEGIN
  -- Calculate reputation from question upvotes
  SELECT COALESCE(SUM(
    CASE WHEN v.value = 1 THEN 10 ELSE 0 END
  ), 0) INTO total_reputation
  FROM public.votes v
  JOIN public.questions q ON v.target_id = q.id
  WHERE v.target_type = 'question' AND q.user_id = target_user_id;

  -- Add reputation from answer upvotes
  SELECT COALESCE(SUM(
    CASE WHEN v.value = 1 THEN 15 ELSE 0 END
  ), 0) INTO total_reputation
  FROM public.votes v
  JOIN public.answers a ON v.target_id = a.id
  WHERE v.target_type = 'answer' AND a.user_id = target_user_id;

  -- Subtract reputation from downvotes received
  SELECT COALESCE(SUM(
    CASE WHEN v.value = -1 THEN -2 ELSE 0 END
  ), 0) INTO total_reputation
  FROM public.votes v
  WHERE v.target_type IN ('question', 'answer')
  AND (
    (v.target_type = 'question' AND EXISTS (SELECT 1 FROM public.questions q WHERE q.id = v.target_id AND q.user_id = target_user_id))
    OR
    (v.target_type = 'answer' AND EXISTS (SELECT 1 FROM public.answers a WHERE a.id = v.target_id AND a.user_id = target_user_id))
  );

  -- Add reputation from answer verifications
  SELECT COALESCE(SUM(verification_count * 2), 0) INTO total_reputation
  FROM public.answers
  WHERE user_id = target_user_id;

  -- Ensure reputation is non-negative
  total_reputation := GREATEST(total_reputation, 0);

  -- Update profiles table
  UPDATE public.profiles
  SET reputation = total_reputation
  WHERE id = target_user_id;

  RETURN total_reputation;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate reputation for all users
CREATE OR REPLACE FUNCTION public.recalculate_all_reputations()
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Reset all reputations to 0 first
  UPDATE public.profiles SET reputation = 0;

  -- Recalculate for each user
  FOR user_record IN SELECT id FROM public.profiles LOOP
    PERFORM public.recalculate_user_reputation(user_record.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing reputations
SELECT public.recalculate_all_reputations();

-- Add comments for documentation
COMMENT ON FUNCTION public.update_reputation_on_vote IS 'Updates user reputation when votes are cast. +10 for question upvote, +15 for answer upvote, -2 for downvote received.';
COMMENT ON FUNCTION public.update_reputation_on_verification IS 'Updates user reputation when answers are verified (+2 per verification).';
COMMENT ON FUNCTION public.recalculate_user_reputation IS 'Recalculates reputation for a specific user from scratch.';
COMMENT ON FUNCTION public.recalculate_all_reputations IS 'Recalculates reputation for all users from scratch.';
