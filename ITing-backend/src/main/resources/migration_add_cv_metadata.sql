-- Migration script to add File_name and S3_key columns to CV table
-- Run this script to update the CV table schema

-- Add File_name column
ALTER TABLE "CV" 
ADD COLUMN IF NOT EXISTS "File_name" VARCHAR(255);

-- Add S3_key column
ALTER TABLE "CV" 
ADD COLUMN IF NOT EXISTS "S3_key" VARCHAR(500);

-- Add comment for new columns
COMMENT ON COLUMN "CV"."File_name" IS 'Original file name of the uploaded CV';
COMMENT ON COLUMN "CV"."S3_key" IS 'AWS S3 key/path for the CV file';

-- Optional: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cv_profile_upload_time ON "CV"("profile_id", "Upload_time" DESC);

-- Display message
DO $$ 
BEGIN 
    RAISE NOTICE 'Migration completed: Added File_name and S3_key columns to CV table';
END $$;
