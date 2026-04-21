-- Fix applicant_name column type if it accidentally became bytea
-- This migration ensures that text search (LOWER, LIKE) works correctly in PostgreSQL
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'apply_form' 
        AND column_name = 'applicant_name' 
        AND data_type = 'bytea'
    ) THEN
        ALTER TABLE Apply_form ALTER COLUMN Applicant_name TYPE VARCHAR(255) USING Applicant_name::text;
    END IF;
END $$;
