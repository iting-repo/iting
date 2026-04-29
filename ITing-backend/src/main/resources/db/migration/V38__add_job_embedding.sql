-- Phase 2: Add embedding_updated_at column to job table
-- Note: job_embedding column already exists from V1 init schema
ALTER TABLE job ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMP;

-- Index to quickly find jobs that haven't been embedded yet
CREATE INDEX IF NOT EXISTS idx_jobs_embedding_null ON job (id) WHERE job_embedding IS NULL AND status = 'ACTIVE';
