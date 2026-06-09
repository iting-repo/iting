-- V131: Grant SUPER_ADMIN role to admin@iting.com
-- Gán quyền SUPER_ADMIN cho tài khoản admin@iting.com (id=1)

UPDATE account
SET admin_role = 'SUPER_ADMIN',
    account_type = 'INTERNAL_STAFF',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@iting.com';
