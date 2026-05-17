ALTER TABLE account ADD COLUMN admin_role VARCHAR(20) DEFAULT NULL;

-- Phân quyền cụ thể cho từng admin
UPDATE account SET admin_role = 'SUPER_ADMIN' WHERE id = 1;  -- System Admin → quyền cao nhất
UPDATE account SET admin_role = 'ADMIN' WHERE id = 2;         -- Super Admin → quản trị tiêu chuẩn
UPDATE account SET admin_role = 'MODERATOR' WHERE id = 3;     -- Content Moderator → kiểm duyệt nội dung

-- Các admin khác (nếu có) mặc định là VIEWER
UPDATE account SET admin_role = 'VIEWER' WHERE role = 'ADMIN' AND admin_role IS NULL;

CREATE INDEX idx_account_admin_role ON account(admin_role);
