-- Add constraints to enforce lowercase usernames with no spaces
-- First, update existing usernames in users table to lowercase and replace spaces with underscores
UPDATE users 
SET username = lower(replace(username, ' ', '_'))
WHERE username != lower(username) OR username LIKE '% %';

-- Add CHECK constraint for lowercase usernames with no spaces in users table
ALTER TABLE users 
ADD CONSTRAINT username_lowercase_no_spaces 
CHECK (username = lower(username) AND position(' ' in username) = 0);

-- Update existing usernames in profiles table to lowercase and replace spaces with underscores
UPDATE profiles 
SET username = lower(replace(username, ' ', '_'))
WHERE username != lower(username) OR username LIKE '% %';

-- Add CHECK constraint for lowercase usernames with no spaces in profiles table
ALTER TABLE profiles 
ADD CONSTRAINT username_lowercase_no_spaces 
CHECK (username = lower(username) AND position(' ' in username) = 0);
