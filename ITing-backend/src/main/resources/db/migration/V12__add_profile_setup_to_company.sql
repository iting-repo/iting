-- Migration to add Profile_setup column to Company table
ALTER TABLE Company ADD COLUMN Profile_setup BOOLEAN DEFAULT FALSE;
UPDATE Company SET Profile_setup = TRUE; -- Mark existing companies as setup to avoid showing setup screen for them
