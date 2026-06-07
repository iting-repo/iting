-- Lưu danh sách trường thay đổi (JSON) cho audit log — phục vụ hiển thị
-- "N trường thay đổi" + bảng trước/sau trong modal chi tiết.
ALTER TABLE activity_logs
    ADD COLUMN IF NOT EXISTS changes TEXT;
