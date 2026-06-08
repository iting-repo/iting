-- 2FA (TOTP / Google Authenticator) cho tài khoản nội bộ ITing.
-- two_factor_secret: khóa Base32 (nhập vào authenticator); two_factor_enabled: đã kích hoạt chưa.
ALTER TABLE account
    ADD COLUMN IF NOT EXISTS two_factor_secret  VARCHAR(64),
    ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;
