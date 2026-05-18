-- Add view_count column to blogs table for click/read tracking
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS view_count BIGINT NOT NULL DEFAULT 0;
