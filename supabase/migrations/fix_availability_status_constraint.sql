-- Drop existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_availability_status;

-- Add updated constraint that allows empty strings
ALTER TABLE public.profiles
ADD CONSTRAINT check_availability_status 
CHECK (availability_status IS NULL OR availability_status = '' OR availability_status IN ('open', 'busy', 'offline'));
