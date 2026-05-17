-- Widen admin_role column to support custom role keys (up to 50 chars)
ALTER TABLE account ALTER COLUMN admin_role TYPE VARCHAR(50);
