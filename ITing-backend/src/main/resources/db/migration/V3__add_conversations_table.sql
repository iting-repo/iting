CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,

    type VARCHAR(20) NOT NULL,

    participant1_id BIGINT NOT NULL,
    participant2_id BIGINT NOT NULL,

    last_message_id BIGINT,
    last_message_content TEXT,
    last_message_time TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX idx_conv_p1 ON conversations(participant1_id);
CREATE INDEX idx_conv_p2 ON conversations(participant2_id);
CREATE INDEX idx_conv_last_time ON conversations(last_message_time);