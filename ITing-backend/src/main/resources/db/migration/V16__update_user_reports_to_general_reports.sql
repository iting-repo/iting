-- Update user_reports table to handle general reports (Job, Company, User, Review)
ALTER TABLE user_reports RENAME COLUMN reported_user_id TO target_id;
ALTER TABLE user_reports ADD COLUMN target_type VARCHAR(50) DEFAULT 'USER';
ALTER TABLE user_reports ADD COLUMN target_name VARCHAR(255);
ALTER TABLE user_reports ADD COLUMN priority VARCHAR(20) DEFAULT 'MEDIUM';

-- Add indexes for better performance
CREATE INDEX idx_reports_target ON user_reports(target_type, target_id);
CREATE INDEX idx_reports_status ON user_reports(status);
CREATE INDEX idx_reports_priority ON user_reports(priority);
