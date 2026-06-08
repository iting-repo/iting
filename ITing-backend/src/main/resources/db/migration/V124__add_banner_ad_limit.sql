-- V124: Giới hạn số banner QUẢNG CÁO (ADVERTISEMENT) đang bật — cấu hình được ở trang Banner.
-- Mặc định 5 (đồng bộ giới hạn carousel cũ).
ALTER TABLE system_configs
    ADD COLUMN IF NOT EXISTS banner_ad_limit INT NOT NULL DEFAULT 5;
