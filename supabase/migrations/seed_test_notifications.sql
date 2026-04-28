-- Seed test notifications for user 203591c9-372d-43aa-9c19-95c8e41815ca

INSERT INTO notifications (user_id, type, title, message, link, metadata, read, created_at) VALUES
  (
    '203591c9-372d-43aa-9c19-95c8e41815ca',
    'vote',
    'Your question received an upvote',
    'john_doe upvoted your question: How to implement React hooks?',
    '/questions/test-question-1',
    '{"question_id": "test-question-1", "vote_value": 1, "voter_username": "john_doe"}',
    false,
    NOW() - INTERVAL '5 minutes'
  ),
  (
    '203591c9-372d-43aa-9c19-95c8e41815ca',
    'comment',
    'New comment on your answer',
    'jane_smith commented on your answer',
    '/questions/test-question-2',
    '{"question_id": "test-question-2", "answer_id": "test-answer-1", "comment_id": "test-comment-1", "commenter_username": "jane_smith"}',
    false,
    NOW() - INTERVAL '1 hour'
  ),
  (
    '203591c9-372d-43aa-9c19-95c8e41815ca',
    'answer',
    'New answer to your question',
    'bob_wilson answered your question: Best practices for TypeScript?',
    '/questions/test-question-3',
    '{"question_id": "test-question-3", "answer_id": "test-answer-2", "answerer_username": "bob_wilson"}',
    true,
    NOW() - INTERVAL '2 hours'
  ),
  (
    '203591c9-372d-43aa-9c19-95c8e41815ca',
    'vote',
    'Your answer received an upvote',
    'alice_brown upvoted your answer',
    '/questions/test-question-4',
    '{"question_id": "test-question-4", "answer_id": "test-answer-3", "vote_value": 1, "voter_username": "alice_brown"}',
    false,
    NOW() - INTERVAL '3 hours'
  ),
  (
    '203591c9-372d-43aa-9c19-95c8e41815ca',
    'verification',
    'Your answer was verified',
    'Your answer was marked as correct',
    '/questions/test-question-5',
    '{"question_id": "test-question-5", "answer_id": "test-answer-4"}',
    true,
    NOW() - INTERVAL '1 day'
  );
