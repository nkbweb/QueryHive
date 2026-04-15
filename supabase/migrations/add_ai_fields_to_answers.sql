-- Add AI-related fields to answers table
ALTER TABLE answers 
ADD COLUMN ai_model TEXT,
ADD COLUMN ai_tokens_used INTEGER DEFAULT 0,
ADD COLUMN ai_confidence_score DECIMAL(3,2),
ADD COLUMN ai_generated_at TIMESTAMPTZ;

-- Create index for AI answers for better query performance
CREATE INDEX idx_answers_is_ai ON answers(is_ai);
CREATE INDEX idx_answers_ai_model ON answers(ai_model);

-- Add comments to describe the new fields
COMMENT ON COLUMN answers.ai_model IS 'The AI model used to generate this answer (e.g., llama-3.3-70b-versatile)';
COMMENT ON COLUMN answers.ai_tokens_used IS 'Number of tokens used to generate this AI answer';
COMMENT ON COLUMN answers.ai_confidence_score IS 'Confidence score of the AI answer (0.00-1.00)';
COMMENT ON COLUMN answers.ai_generated_at IS 'Timestamp when the AI answer was generated';
