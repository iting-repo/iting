-- =====================================================================
-- V87: Thêm cột extracted_data_json vào CV.
--
-- Lưu JSON output của HF /extract-cv: skills, experience, education,
-- personal info được AI parse từ file CV upload.
-- Dùng để pre-fill UserProfile hoặc hiển thị tóm tắt nhanh.
-- =====================================================================

ALTER TABLE cv
    ADD COLUMN IF NOT EXISTS extracted_data_json TEXT;
