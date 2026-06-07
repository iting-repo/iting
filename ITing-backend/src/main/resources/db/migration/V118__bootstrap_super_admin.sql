-- V118: Bootstrap ít nhất một SUPER_ADMIN để vận hành quy trình duyệt vai trò (Rule 4).
-- Chỉ super admin mới approve/reject role; ban đầu chưa ai có admin_role=SUPER_ADMIN,
-- nên cấp cho tài khoản ADMIN có id nhỏ nhất (tài khoản gốc của hệ thống).
-- Idempotent: chỉ chạy khi hệ thống chưa có super admin nào.
UPDATE account
SET admin_role = 'SUPER_ADMIN',
    account_type = 'INTERNAL_STAFF'
WHERE id = (
    SELECT MIN(id) FROM account WHERE role = 'ADMIN'
)
AND NOT EXISTS (
    SELECT 1 FROM account WHERE admin_role = 'SUPER_ADMIN'
);
