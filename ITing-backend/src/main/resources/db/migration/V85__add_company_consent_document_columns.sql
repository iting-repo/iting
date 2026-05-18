-- Add missing consent document columns referenced by Company entity but not in DB
ALTER TABLE company
    ADD COLUMN IF NOT EXISTS consent_document_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS consent_document_preview_url TEXT;
