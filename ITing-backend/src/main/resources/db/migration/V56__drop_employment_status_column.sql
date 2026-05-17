-- Remove employment_status column from candidate_profiles
ALTER TABLE candidate_profiles DROP COLUMN IF EXISTS employment_status;
