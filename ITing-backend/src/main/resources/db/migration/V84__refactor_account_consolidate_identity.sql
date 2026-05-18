-- =====================================================================
-- V84: Hoàn tất consolidate identity vào Account.
--
-- V54 đã:
--   - dồn full_name/phone/avatar_url từ users + admin_accounts về account
--   - drop các cột duplicate trên users (full_name, phone_num, avatar)
--   - drop các cột duplicate trên admin_accounts (full_name, phone, avatar_url,
--     active, last_login, created_at, updated_at)
--   - rename users → candidate_info
--
-- V84 chỉ làm phần còn thiếu, idempotent với mọi state:
--   - thêm last_login_ip + login_count vào account (gộp login tracking)
--   - backfill 2 cột đó từ admin_accounts (nếu các cột nguồn còn)
--   - thêm staff_code + admin_level vào admin_accounts (đề xuất ERD mới)
--   - backfill admin_level từ account.admin_role
-- =====================================================================

-- ───────────── ACCOUNT: thêm login_count + last_login_ip ─────────────
ALTER TABLE account
    ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(64),
    ADD COLUMN IF NOT EXISTS login_count   INT NOT NULL DEFAULT 0;

-- Backfill login_count + last_login_ip từ admin_accounts nếu các cột nguồn còn
-- (Account.last_login_at đã được V8/V9 + V54 xử lý.)
DO $$
DECLARE
    has_login_count   BOOLEAN;
    has_last_login_ip BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name = 'admin_accounts' AND column_name = 'login_count'
    ) INTO has_login_count;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name = 'admin_accounts' AND column_name = 'last_login_ip'
    ) INTO has_last_login_ip;

    IF has_login_count THEN
        EXECUTE $sql$
            UPDATE account a
               SET login_count = GREATEST(a.login_count, COALESCE(ad.login_count, 0))
              FROM admin_accounts ad
             WHERE ad.id = a.id
        $sql$;
    END IF;

    IF has_last_login_ip THEN
        EXECUTE $sql$
            UPDATE account a
               SET last_login_ip = COALESCE(a.last_login_ip, ad.last_login_ip)
              FROM admin_accounts ad
             WHERE ad.id = a.id
        $sql$;
    END IF;
END $$;

-- ───────────── ADMIN_ACCOUNTS: thêm staff_code + admin_level ─────────
ALTER TABLE admin_accounts
    ADD COLUMN IF NOT EXISTS staff_code  VARCHAR(50),
    ADD COLUMN IF NOT EXISTS admin_level VARCHAR(20);

-- Unique constraint cho staff_code (chỉ apply khi NOT NULL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_admin_accounts_staff_code'
    ) THEN
        ALTER TABLE admin_accounts
            ADD CONSTRAINT uk_admin_accounts_staff_code UNIQUE (staff_code);
    END IF;
END $$;

-- Backfill admin_level từ account.admin_role (V65 đã thêm cột này vào account)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_name = 'account' AND column_name = 'admin_role'
    ) THEN
        EXECUTE $sql$
            UPDATE admin_accounts ad
               SET admin_level = a.admin_role
              FROM account a
             WHERE a.id = ad.id
               AND ad.admin_level IS NULL
               AND a.admin_role IS NOT NULL
        $sql$;
    END IF;
END $$;

-- ───────────── CLEANUP: drop các cột legacy còn sót (nếu có) ─────────
-- Ở DB cũ chưa apply V54, các cột này vẫn tồn tại — drop idempotent.
ALTER TABLE admin_accounts
    DROP COLUMN IF EXISTS full_name,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS avatar_url,
    DROP COLUMN IF EXISTS active,
    DROP COLUMN IF EXISTS last_login,
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

-- Bảng "users" đã đổi tên → candidate_info ở V54. Không động đến.
