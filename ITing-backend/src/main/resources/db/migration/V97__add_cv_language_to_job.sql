-- ============================================================================
-- V95: Thêm cột cv_language vào Job
-- HR đặt yêu cầu ngôn ngữ CV (VIETNAMESE / ENGLISH / BOTH / ANY) để ứng viên
-- biết đường nộp đúng loại.
-- ============================================================================

ALTER TABLE Job
    ADD COLUMN IF NOT EXISTS cv_language VARCHAR(20) NOT NULL DEFAULT 'ANY';

-- Job cũ trước migration đều không có yêu cầu cụ thể → ANY
UPDATE Job SET cv_language = 'ANY' WHERE cv_language IS NULL;
