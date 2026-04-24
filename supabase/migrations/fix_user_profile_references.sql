-- Fix foreign key references to use profiles table instead of users table
-- This fixes the issue where user details show as "Unknown" in answer/explore pages

-- Drop existing foreign key constraints
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_user_id_fkey;
ALTER TABLE answers DROP CONSTRAINT IF EXISTS answers_user_id_fkey;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Add new foreign key constraints pointing to profiles table
ALTER TABLE questions 
ADD CONSTRAINT questions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE answers 
ADD CONSTRAINT answers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE votes 
ADD CONSTRAINT votes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
