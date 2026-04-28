-- Notification Triggers
-- These triggers automatically create notifications when users receive votes, comments, etc.

-- Function to create notification for votes on questions
CREATE OR REPLACE FUNCTION notify_question_vote()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  voter_username TEXT;
  question_title TEXT;
BEGIN
  -- Don't notify if user votes on their own content
  IF NEW.user_id = (
    SELECT user_id FROM questions WHERE id = NEW.target_id
  ) THEN
    RETURN NEW;
  END IF;

  -- Get the question owner and title
  SELECT user_id, title INTO target_user_id, question_title
  FROM questions WHERE id = NEW.target_id;

  -- Get voter username
  SELECT username INTO voter_username
  FROM profiles WHERE id = NEW.user_id;

  -- Create notification for upvotes only
  IF NEW.value = 1 THEN
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      target_user_id,
      'vote',
      'Your question received an upvote',
      COALESCE(voter_username, 'Someone') || ' upvoted your question: ' || question_title,
      '/questions/' || NEW.target_id,
      jsonb_build_object(
        'question_id', NEW.target_id,
        'vote_value', NEW.value,
        'voter_username', voter_username
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for votes on answers
CREATE OR REPLACE FUNCTION notify_answer_vote()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  voter_username TEXT;
  question_id UUID;
  question_title TEXT;
BEGIN
  -- Don't notify if user votes on their own content
  IF NEW.user_id = (
    SELECT user_id FROM answers WHERE id = NEW.target_id
  ) THEN
    RETURN NEW;
  END IF;

  -- Get the answer owner and question info
  SELECT a.user_id, a.question_id, q.title INTO target_user_id, question_id, question_title
  FROM answers a
  JOIN questions q ON a.question_id = q.id
  WHERE a.id = NEW.target_id;

  -- Get voter username
  SELECT username INTO voter_username
  FROM profiles WHERE id = NEW.user_id;

  -- Create notification for upvotes only
  IF NEW.value = 1 THEN
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      target_user_id,
      'vote',
      'Your answer received an upvote',
      COALESCE(voter_username, 'Someone') || ' upvoted your answer',
      '/questions/' || question_id,
      jsonb_build_object(
        'question_id', question_id,
        'answer_id', NEW.target_id,
        'vote_value', NEW.value,
        'voter_username', voter_username
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for comments on answers
CREATE OR REPLACE FUNCTION notify_comment()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  commenter_username TEXT;
  question_id UUID;
  question_title TEXT;
BEGIN
  -- Don't notify if user comments on their own answer
  IF NEW.user_id = (
    SELECT user_id FROM answers WHERE id = NEW.answer_id
  ) THEN
    RETURN NEW;
  END IF;

  -- Get the answer owner and question info
  SELECT a.user_id, a.question_id, q.title INTO target_user_id, question_id, question_title
  FROM answers a
  JOIN questions q ON a.question_id = q.id
  WHERE a.id = NEW.answer_id;

  -- Get commenter username
  SELECT username INTO commenter_username
  FROM profiles WHERE id = NEW.user_id;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  VALUES (
    target_user_id,
    'comment',
    'New comment on your answer',
    COALESCE(commenter_username, 'Someone') || ' commented on your answer',
    '/questions/' || question_id,
    jsonb_build_object(
      'question_id', question_id,
      'answer_id', NEW.answer_id,
      'comment_id', NEW.id,
      'commenter_username', commenter_username
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for new answers on questions
CREATE OR REPLACE FUNCTION notify_answer()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  answerer_username TEXT;
  question_title TEXT;
BEGIN
  -- Don't notify if user answers their own question
  IF NEW.user_id = (
    SELECT user_id FROM questions WHERE id = NEW.question_id
  ) THEN
    RETURN NEW;
  END IF;

  -- Get the question owner and title
  SELECT user_id, title INTO target_user_id, question_title
  FROM questions WHERE id = NEW.question_id;

  -- Get answerer username
  SELECT username INTO answerer_username
  FROM profiles WHERE id = NEW.user_id;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  VALUES (
    target_user_id,
    'answer',
    'New answer to your question',
    COALESCE(answerer_username, 'Someone') || ' answered your question: ' || question_title,
    '/questions/' || NEW.question_id,
    jsonb_build_object(
      'question_id', NEW.question_id,
      'answer_id', NEW.id,
      'answerer_username', answerer_username
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_question_vote ON votes;
CREATE TRIGGER trigger_notify_question_vote
AFTER INSERT ON votes
FOR EACH ROW
WHEN (NEW.target_type = 'question')
EXECUTE FUNCTION notify_question_vote();

DROP TRIGGER IF EXISTS trigger_notify_answer_vote ON votes;
CREATE TRIGGER trigger_notify_answer_vote
AFTER INSERT ON votes
FOR EACH ROW
WHEN (NEW.target_type = 'answer')
EXECUTE FUNCTION notify_answer_vote();

DROP TRIGGER IF EXISTS trigger_notify_comment ON comments;
CREATE TRIGGER trigger_notify_comment
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION notify_comment();

DROP TRIGGER IF EXISTS trigger_notify_answer ON answers;
CREATE TRIGGER trigger_notify_answer
AFTER INSERT ON answers
FOR EACH ROW
EXECUTE FUNCTION notify_answer();

-- Add comments for documentation
COMMENT ON FUNCTION notify_question_vote IS 'Creates a notification when a question receives an upvote';
COMMENT ON FUNCTION notify_answer_vote IS 'Creates a notification when an answer receives an upvote';
COMMENT ON FUNCTION notify_comment IS 'Creates a notification when someone comments on an answer';
COMMENT ON FUNCTION notify_answer IS 'Creates a notification when someone answers a question';
