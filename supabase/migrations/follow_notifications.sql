-- Follow Notifications Migration
-- This migration adds notification triggers for follow events

-- Function to create notification for new followers
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
  follower_username TEXT;
BEGIN
  -- Get follower username
  SELECT username INTO follower_username FROM profiles WHERE id = NEW.follower_id;
  
  -- Create notification for the user being followed
  INSERT INTO notifications (user_id, type, title, message, link, data, read, created_at)
  VALUES (
    NEW.following_id,
    'follow',
    'New follower',
    COALESCE(follower_username, 'Someone') || ' started following you',
    '/profile/' || COALESCE(follower_username, 'unknown'),
    jsonb_build_object(
      'follower_id', NEW.follower_id,
      'follower_username', COALESCE(follower_username, 'Someone'),
      'followed_at', NEW.created_at
    ),
    false,
    NEW.created_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new follower notifications
DROP TRIGGER IF EXISTS trigger_notify_new_follower ON user_follows;
CREATE TRIGGER trigger_notify_new_follower
AFTER INSERT ON user_follows
FOR EACH ROW
EXECUTE FUNCTION notify_new_follower();

-- Add comment for documentation
COMMENT ON FUNCTION notify_new_follower IS 'Creates a notification when a user gets a new follower';
