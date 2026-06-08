-- Mở rộng tin nhắn: đính kèm tệp/ảnh, link preview (Open Graph), và sticker.
ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    ADD COLUMN IF NOT EXISTS attachments  TEXT,          -- JSON array: [{url,name,contentType,size}]
    ADD COLUMN IF NOT EXISTS link_preview TEXT,          -- JSON object: {url,title,description,image,siteName}
    ADD COLUMN IF NOT EXISTS sticker_url  VARCHAR(500);

-- Tin nhắn chỉ-sticker / chỉ-file có thể không có nội dung text → cho phép NULL.
ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;
