-- Thêm cờ "Cho phép ứng viên đánh giá công ty" vào cấu hình hệ thống.
-- Mặc định TRUE để giữ nguyên hành vi hiện tại (đánh giá đang bật).
ALTER TABLE system_configs
    ADD COLUMN IF NOT EXISTS allow_company_reviews BOOLEAN DEFAULT TRUE;

UPDATE system_configs
SET allow_company_reviews = TRUE
WHERE allow_company_reviews IS NULL;
