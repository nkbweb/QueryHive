-- Check if votes are being inserted
SELECT * FROM votes ORDER BY created_at DESC LIMIT 5;

-- Check if triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%reputation%';
