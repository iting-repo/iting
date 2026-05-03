-- Thêm cột lưu danh sách mạng xã hội của công ty (JSON serialize từ List<{platform,url}>).
-- Lý do dùng JSON 1 cột thay vì bảng riêng: dữ liệu nhỏ, không cần index/join, frontend
-- luôn ghi/đọc cả list trong 1 lần (replace-all semantics).
--
-- LƯU Ý: V1 dùng `CREATE TABLE Company` (unquoted) → PostgreSQL fold về `company`.
-- KHÔNG dùng `ALTER TABLE "Company"` (case-sensitive khi quote) — sẽ lỗi
-- "relation Company does not exist". Khớp với pattern của V48/V49.

ALTER TABLE company
    ADD COLUMN IF NOT EXISTS social_links TEXT;

COMMENT ON COLUMN company.social_links IS
    'JSON array of {platform, url}, e.g. [{"platform":"FACEBOOK","url":"..."}]';
