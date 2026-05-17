-- Premium tier expiry (NULL = free tier)
ALTER TABLE Account
    ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP,
    ADD COLUMN IF NOT EXISTS premium_source VARCHAR(50);  -- 'REFERRAL' | 'PURCHASE' | 'GIFT' | 'ADMIN_GRANT'

CREATE INDEX IF NOT EXISTS idx_account_premium_until
    ON Account (premium_until)
    WHERE premium_until IS NOT NULL;
