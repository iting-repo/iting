-- Add brute-force protection columns to Account table
ALTER TABLE Account
    ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_account_locked_until
    ON Account (locked_until)
    WHERE locked_until IS NOT NULL;
