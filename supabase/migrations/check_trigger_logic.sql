-- Check if the trigger can find the target user for a specific vote
-- Replace with actual vote ID from your database
SELECT 
  v.target_id,
  v.target_type,
  q.user_id as question_user_id,
  p.username as profile_username,
  p.reputation as current_reputation
FROM votes v
LEFT JOIN questions q ON v.target_type = 'question' AND v.target_id = q.id
LEFT JOIN profiles p ON q.user_id = p.id
WHERE v.target_type = 'question'
ORDER BY v.created_at DESC
LIMIT 1;
