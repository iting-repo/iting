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
ALTER TABLE Account
    ADD COLUMN IF NOT EXISTS full_name   VARCHAR(255),
    ADD COLUMN IF NOT EXISTS phone       VARCHAR(20),
    ADD COLUMN IF NOT EXISTS avatar_url  TEXT;

-- ── BƯỚC 2: Migrate dữ liệu từ Users → Account (role = CANDIDATE) ───────────
UPDATE Account a
SET
    full_name  = u.full_name,
    phone      = u.Phone_num,
    avatar_url = u.Avatar
FROM Users u
WHERE u.Id = a.Id;

-- ── BƯỚC 3: Migrate dữ liệu từ admin_accounts → Account (role = ADMIN) ───────
-- Chỉ ghi đè nếu Account chưa có giá trị (tránh overwrite candidate đã migrate)
UPDATE Account a
SET
    full_name  = COALESCE(a.full_name,  adm.full_name),
    phone      = COALESCE(a.phone,      adm.phone),
    avatar_url = COALESCE(a.avatar_url, adm.avatar_url)
FROM admin_accounts adm
WHERE adm.id = a.Id;

-- ── BƯỚC 4: Đặt NOT NULL sau khi đã migrate ─────────────────────────────────
UPDATE Account SET full_name = 'Unknown' WHERE full_name IS NULL;
ALTER TABLE Account ALTER COLUMN full_name SET NOT NULL;

-- ── BƯỚC 5: Xóa cột dư thừa khỏi Users ──────────────────────────────────────
ALTER TABLE Users
    DROP COLUMN IF EXISTS full_name,
    DROP COLUMN IF EXISTS Phone_num,
    DROP COLUMN IF EXISTS Avatar;

-- ── BƯỚC 6: Xóa cột dư thừa khỏi admin_accounts ─────────────────────────────
ALTER TABLE admin_accounts
    DROP COLUMN IF EXISTS full_name,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS avatar_url,
    DROP COLUMN IF EXISTS active,
    DROP COLUMN IF EXISTS last_login,
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

-- ── BƯỚC 7: Đổi tên bảng Users → candidate_info ──────────────────────────────
ALTER TABLE IF EXISTS Users RENAME TO candidate_info;
