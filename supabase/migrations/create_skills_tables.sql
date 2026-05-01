-- Create skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_skills junction table
CREATE TABLE IF NOT EXISTS public.user_skills (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, skill_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS skills_category_idx ON public.skills(category);
CREATE INDEX IF NOT EXISTS skills_name_idx ON public.skills(name);
CREATE INDEX IF NOT EXISTS user_skills_user_id_idx ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS user_skills_skill_id_idx ON public.user_skills(skill_id);

-- Enable Row Level Security
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- Policies for skills table (public read access)
CREATE POLICY "Skills are viewable by everyone"
ON public.skills FOR SELECT
USING (true);

-- Policies for user_skills table
CREATE POLICY "User skills are viewable by everyone"
ON public.user_skills FOR SELECT
USING (true);

CREATE POLICY "Users can add their own skills"
ON public.user_skills FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own skills"
ON public.user_skills FOR DELETE
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.skills TO authenticated;
GRANT SELECT ON public.skills TO anon;
GRANT ALL ON public.user_skills TO authenticated;
GRANT SELECT ON public.user_skills TO anon;
