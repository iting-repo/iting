-- Add employer_note column to Apply_form_user_to_job for storing HR's note on accept/reject decisions
ALTER TABLE Apply_form_user_to_job
    ADD COLUMN IF NOT EXISTS Employer_note TEXT;
