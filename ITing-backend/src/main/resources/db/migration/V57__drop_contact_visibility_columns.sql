-- Remove unused visibility toggle columns from contact_info
ALTER TABLE contact_info DROP COLUMN IF EXISTS show_phone_to_recruiter;
ALTER TABLE contact_info DROP COLUMN IF EXISTS show_email_to_recruiter;
