-- ============================================================================
-- ITing Job Portal - Messaging Schema
-- ============================================================================
-- Purpose: Real-time messaging system for User-User and User-Company communication
-- Dependencies: Existing tables - users, company, account
-- ============================================================================

-- ============================================================================
-- Table: conversations
-- Description: Manages conversation threads between participants
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('USER_USER', 'USER_COMPANY')),
    participant1_id BIGINT NOT NULL, -- Always user_id
    participant2_id BIGINT NOT NULL, -- user_id or company_id based on type
    last_message_id BIGINT,
    last_message_content TEXT,
    last_message_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_conversation UNIQUE (type, participant1_id, participant2_id)
);

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conv_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conv_participant2 ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conv_last_message_time ON conversations(last_message_time DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_conv_type ON conversations(type);

-- Comments
COMMENT ON TABLE conversations IS 'Conversation threads between users or between user and company';
COMMENT ON COLUMN conversations.type IS 'Type of conversation: USER_USER or USER_COMPANY';
COMMENT ON COLUMN conversations.participant1_id IS 'Always refers to users.id';
COMMENT ON COLUMN conversations.participant2_id IS 'Refers to users.id for USER_USER, company.company_id for USER_COMPANY';

-- ============================================================================
-- Table: messages
-- Description: Stores individual messages in conversations
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL, -- Account ID
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('USER', 'COMPANY')),
    receiver_id BIGINT NOT NULL, -- Account ID
    receiver_type VARCHAR(20) NOT NULL CHECK (receiver_type IN ('USER', 'COMPANY')),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_msg_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_msg_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_sender ON messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_msg_receiver ON messages(receiver_id, receiver_type);
CREATE INDEX IF NOT EXISTS idx_msg_unread ON messages(receiver_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_msg_created_at ON messages(created_at DESC);

-- Comments
COMMENT ON TABLE messages IS 'Individual messages in conversations';
COMMENT ON COLUMN messages.sender_type IS 'Type of sender: USER or COMPANY';
COMMENT ON COLUMN messages.receiver_type IS 'Type of receiver: USER or COMPANY';
COMMENT ON COLUMN messages.is_read IS 'Whether the message has been read by receiver';

-- ============================================================================
-- Trigger: Update conversation last_message after insert
-- ============================================================================
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET 
        last_message_id = NEW.id,
        last_message_content = NEW.content,
        last_message_time = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_last_message ON messages;
CREATE TRIGGER trigger_update_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- ============================================================================
-- END OF MESSAGING SCHEMA
-- ============================================================================
