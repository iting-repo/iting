ALTER TABLE Company
    ADD COLUMN IF NOT EXISTS Document_review_status VARCHAR(50) DEFAULT 'MISSING',
    ADD COLUMN IF NOT EXISTS Profile_setup BOOLEAN DEFAULT FALSE;

UPDATE Company
SET Document_review_status = COALESCE(Document_review_status, 'MISSING'),
    Profile_setup = COALESCE(Profile_setup, FALSE);
