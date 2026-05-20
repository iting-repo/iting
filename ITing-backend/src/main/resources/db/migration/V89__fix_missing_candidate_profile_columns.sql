-- =====================================================================
-- V89: Ensure candidate_profiles has all columns required by UserProfile entity
-- Fix: "column education_summary does not exist" error
-- =====================================================================

ALTER TABLE candidate_profiles
    ADD COLUMN IF NOT EXISTS education_summary VARCHAR(50),
    ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS headline VARCHAR(255),
    ADD COLUMN IF NOT EXISTS location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS total_experience_years INTEGER,
    ADD COLUMN IF NOT EXISTS short_bio TEXT,
    ADD COLUMN IF NOT EXISTS is_open_to_work BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
