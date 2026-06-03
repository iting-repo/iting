-- Thêm soft-delete + edit tracking cho messages.
-- Lý do soft delete: WebSocket đã broadcast id, hard delete sẽ làm clients
-- thấy missing message ngẫu nhiên. UI hiển thị "Tin nhắn đã thu hồi".

ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS is_edited BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;
