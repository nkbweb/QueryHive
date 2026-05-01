-- Add profile enhancement columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS availability_status TEXT,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Add check constraint for availability_status
ALTER TABLE public.profiles
ADD CONSTRAINT check_availability_status 
CHECK (availability_status IS NULL OR availability_status = '' OR availability_status IN ('open', 'busy', 'offline'));

-- Add index for last_active_at for performance
CREATE INDEX IF NOT EXISTS profiles_last_active_at_idx ON public.profiles(last_active_at DESC);
