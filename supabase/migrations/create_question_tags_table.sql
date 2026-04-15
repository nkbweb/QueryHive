-- Junction table for many-to-many relationship between questions and tags
CREATE TABLE public.question_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT question_tags_pkey PRIMARY KEY (id),
  CONSTRAINT question_tags_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE,
  CONSTRAINT question_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE,
  CONSTRAINT question_tags_question_tag_unique UNIQUE (question_id, tag_id)
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX idx_question_tags_question_id ON public.question_tags(question_id);
CREATE INDEX idx_question_tags_tag_id ON public.question_tags(tag_id);

-- Update the question_count in tags table when question_tags are added/removed
CREATE OR REPLACE FUNCTION update_tag_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tags SET question_count = question_count + 1 WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tags SET question_count = question_count - 1 WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_question_count
  AFTER INSERT OR DELETE ON public.question_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_question_count();
