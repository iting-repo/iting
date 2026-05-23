-- V101: Add credits column to account for HR subscription benefits
ALTER TABLE account ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 0;

-- Index for quick lookup of accounts with credits
CREATE INDEX IF NOT EXISTS idx_account_credits ON account(credits) WHERE credits > 0;
