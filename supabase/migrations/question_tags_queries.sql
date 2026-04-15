-- Example queries for working with questions and tags

-- 1. Get a question with all its tags
SELECT 
  q.*,
  JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', t.id,
      'name', t.name,
      'description', t.description,
      'color', t.color
    )
  ) as tags
FROM questions q
LEFT JOIN question_tags qt ON q.id = qt.question_id
LEFT JOIN tags t ON qt.tag_id = t.id
WHERE q.id = $1
GROUP BY q.id;

-- 2. Get all questions with their tags
SELECT 
  q.*,
  JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', t.id,
      'name', t.name,
      'description', t.description,
      'color', t.color
    )
  ) FILTER (WHERE t.id IS NOT NULL) as tags
FROM questions q
LEFT JOIN question_tags qt ON q.id = qt.question_id
LEFT JOIN tags t ON qt.tag_id = t.id
GROUP BY q.id
ORDER BY q.created_at DESC;

-- 3. Add tags to a question
INSERT INTO question_tags (question_id, tag_id)
VALUES 
  ($1, $2),  -- question_id, tag_id
  ($1, $3);  -- question_id, another_tag_id

-- 4. Remove a tag from a question
DELETE FROM question_tags 
WHERE question_id = $1 AND tag_id = $2;

-- 5. Get questions by tag
SELECT DISTINCT q.*
FROM questions q
JOIN question_tags qt ON q.id = qt.question_id
WHERE qt.tag_id = $1
ORDER BY q.created_at DESC;

-- 6. Get popular tags (most used)
SELECT 
  t.*,
  COUNT(qt.question_id) as usage_count
FROM tags t
LEFT JOIN question_tags qt ON t.id = qt.tag_id
GROUP BY t.id, t.name, t.description, t.color, t.question_count, t.created_at
ORDER BY usage_count DESC, t.name ASC;

-- 7. Create or get a tag by name
INSERT INTO tags (name, description, color)
VALUES ($1, $2, $3)
ON CONFLICT (name) 
DO UPDATE SET 
  description = COALESCE(EXCLUDED.description, tags.description),
  color = COALESCE(EXCLUDED.color, tags.color)
RETURNING *;
