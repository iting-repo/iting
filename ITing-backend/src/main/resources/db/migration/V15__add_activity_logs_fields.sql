-- Migration V15: Add target_name, from_status, to_status to activity_logs table
ALTER TABLE activity_logs 
ADD COLUMN target_name VARCHAR(255),
ADD COLUMN from_status VARCHAR(50),
ADD COLUMN to_status VARCHAR(50);

-- Update existing records with default target name if empty (optional)
UPDATE activity_logs SET target_name = entity_type || ' #' || entity_id WHERE target_name IS NULL AND entity_id IS NOT NULL;
