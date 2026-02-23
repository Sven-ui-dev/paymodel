-- Add full_name column to profiles table if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
