-- Enable Realtime for answers table
-- This allows the frontend to receive instant updates when answers are inserted/updated

-- Turn on realtime for the answers table
alter publication supabase_realtime add table answers;
