-- V65: Add admin_role column to Account table.
-- Used by Account entity (adminRole field) to store sub-role for ADMIN accounts
-- (e.g. 'SUPER_ADMIN', 'MODERATOR'). NULL for non-admin accounts.
ALTER TABLE account
    ADD COLUMN IF NOT EXISTS admin_role VARCHAR(50);
