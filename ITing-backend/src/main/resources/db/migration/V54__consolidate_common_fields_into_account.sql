-- ============================================================================
-- V54: Consolidate common user fields (fullName, phone, avatarUrl) into Account
--
-- Trước đây mỗi loại user (Candidate, Admin) lưu fullName/phone/avatarUrl
-- riêng biệt → dư thừa. Dồn về Account là single source of truth.
--
-- Bảng Users: bỏ full_name, Phone_num, Avatar → đổi tên class thành CandidateProfile
-- Bảng admin_accounts: bỏ full_name, phone, avatar_url, active, created_at,
--   updated_at, last_login (đã có trong Account qua lastLoginAt + AuditEntity)
-- ============================================================================

-- ── BƯỚC 1: Thêm cột mới vào Account ────────────────────────────────────────
ALTER TABLE account
    ADD COLUMN IF NOT EXISTS full_name   VARCHAR(255),
    ADD COLUMN IF NOT EXISTS phone       VARCHAR(20),
    ADD COLUMN IF NOT EXISTS avatar_url  TEXT;

-- ── BƯỚC 2: Migrate dữ liệu từ Users → Account (role = CANDIDATE / EMPLOYER) ─
UPDATE account a
SET
    full_name  = u.full_name,
    phone      = u.phone_num,
    avatar_url = u.avatar
FROM users u
WHERE u.id = a.id;

-- ── BƯỚC 3: Migrate dữ liệu từ admin_accounts → Account (role = ADMIN) ───────
-- Chỉ ghi đè nếu Account chưa có giá trị (tránh overwrite candidate đã migrate)
UPDATE account a
SET
    full_name  = COALESCE(a.full_name,  adm.full_name),
    phone      = COALESCE(a.phone,      adm.phone),
    avatar_url = COALESCE(a.avatar_url, adm.avatar_url)
FROM admin_accounts adm
WHERE adm.id = a.id;

-- ── BƯỚC 4: Đặt NOT NULL sau khi đã migrate (nếu cần) ────────────────────────
-- fullName bắt buộc với mọi tài khoản
UPDATE account SET full_name = 'Unknown' WHERE full_name IS NULL;
ALTER TABLE account ALTER COLUMN full_name SET NOT NULL;

-- ── BƯỚC 5: Xóa cột dư thừa khỏi Users ──────────────────────────────────────
ALTER TABLE users
    DROP COLUMN IF EXISTS full_name,
    DROP COLUMN IF EXISTS phone_num,
    DROP COLUMN IF EXISTS avatar;

-- ── BƯỚC 6: Xóa cột dư thừa khỏi admin_accounts ─────────────────────────────
-- full_name, phone, avatar_url → đã có trong Account
-- active    → dùng Account.Status (ACTIVE/BANNED/INACTIVE) thay thế
-- last_login, created_at, updated_at → đã có Account.lastLoginAt + AuditEntity
ALTER TABLE admin_accounts
    DROP COLUMN IF EXISTS full_name,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS avatar_url,
    DROP COLUMN IF EXISTS active,
    DROP COLUMN IF EXISTS last_login,
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

-- ── BƯỚC 7: Đổi tên bảng Users → candidate_info ──────────────────────────────
-- (tránh nhầm với candidate_profiles đã tồn tại)
ALTER TABLE IF EXISTS users RENAME TO candidate_info;
