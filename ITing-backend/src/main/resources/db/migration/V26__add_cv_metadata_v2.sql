-- Add missing columns to CV table
ALTER TABLE CV ADD COLUMN IF NOT EXISTS File_name VARCHAR(255);
ALTER TABLE CV ADD COLUMN IF NOT EXISTS S3_key VARCHAR(500);

-- Also add indexes for these columns if needed
CREATE INDEX IF NOT EXISTS idx_cv_file_name ON CV(File_name);
CREATE INDEX IF NOT EXISTS idx_cv_s3_key ON CV(S3_key);
