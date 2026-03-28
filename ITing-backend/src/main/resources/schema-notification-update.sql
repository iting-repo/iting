-- ============================================================================
-- ITing Job Portal - Notification Schema Update
-- ============================================================================
-- Purpose: Extend notification table with recipient, type, and read status
-- ============================================================================

-- Add new columns to notification table
ALTER TABLE notification 
ADD COLUMN IF NOT EXISTS recipient_id BIGINT,
ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(20) DEFAULT 'USER' CHECK (recipient_type IN ('USER', 'COMPANY', 'ADMIN')),
ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS entity_id BIGINT,
ADD COLUMN IF NOT EXISTS action_url TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notif_recipient ON notification(recipient_id, recipient_type, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_type ON notification(type);
CREATE INDEX IF NOT EXISTS idx_notif_created ON notification(time DESC);
CREATE INDEX IF NOT EXISTS idx_notif_entity ON notification(entity_type, entity_id);

-- Comments
COMMENT ON COLUMN notification.recipient_id IS 'ID of the recipient (user_id, company_id, or admin_id)';
COMMENT ON COLUMN notification.recipient_type IS 'Type of recipient: USER, COMPANY, or ADMIN';
COMMENT ON COLUMN notification.type IS 'Notification type: JOB_NEW, JOB_MATCH, JOB_EXPIRED, APPLICATION_VIEWED, APPLICATION_ACCEPTED, APPLICATION_REJECTED, COMPANY_UPDATE, COMPANY_FOLLOWED, MESSAGE_NEW, SYSTEM_ANNOUNCEMENT, etc.';
COMMENT ON COLUMN notification.is_read IS 'Whether the notification has been read';
COMMENT ON COLUMN notification.entity_type IS 'Related entity type: Job, Application, Company, Message, etc.';
COMMENT ON COLUMN notification.entity_id IS 'Related entity ID for direct linking';
COMMENT ON COLUMN notification.action_url IS 'Frontend URL to navigate when notification is clicked';

-- ============================================================================
-- END OF NOTIFICATION SCHEMA UPDATE
-- ============================================================================
