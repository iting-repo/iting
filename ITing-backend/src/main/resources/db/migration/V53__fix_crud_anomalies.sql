-- ============================================================================
-- V53: Fix CRUD anomalies identified in ERD analysis
-- ============================================================================

-- ============================================================
-- A3: Fix BanHistory.admin_account_id FK target
-- Old FK points to Account (allows any role to be "admin" actor).
-- New FK points to admin_accounts so only real admins can be recorded.
-- ============================================================
ALTER TABLE ban_history DROP CONSTRAINT IF EXISTS fk_ban_admin;

-- Remove orphaned ban records whose admin_account_id is not a real admin
DELETE FROM ban_history
WHERE admin_account_id NOT IN (SELECT id FROM admin_accounts);

ALTER TABLE ban_history
    ADD CONSTRAINT fk_ban_admin_to_admin
        FOREIGN KEY (admin_account_id) REFERENCES admin_accounts(id) ON DELETE CASCADE;


-- ============================================================
-- A5: Prevent duplicate applications (same user, same job)
-- Add user_id column to Apply_form_user_to_job and enforce
-- UNIQUE (job_id, user_id) at DB level.
-- ============================================================
ALTER TABLE apply_form_user_to_job
    ADD COLUMN IF NOT EXISTS user_id BIGINT;

-- Populate user_id from parent Apply_form
UPDATE apply_form_user_to_job afj
SET user_id = af.user_id
FROM apply_form af
WHERE af.id = afj.apply_form_id
  AND afj.user_id IS NULL;

-- Remove any rows where user_id could not be resolved (orphaned apply_form)
DELETE FROM apply_form_user_to_job WHERE user_id IS NULL;

ALTER TABLE apply_form_user_to_job
    ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_apply_job_user'
    ) THEN
        ALTER TABLE apply_form_user_to_job
            ADD CONSTRAINT fk_apply_job_user
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END;
$$;

-- Remove duplicate applications (same user, same job) keeping the earliest one
DELETE FROM apply_form_user_to_job a
USING apply_form_user_to_job b
WHERE a.job_id = b.job_id
  AND a.user_id = b.user_id
  AND a.apply_form_id > b.apply_form_id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_one_apply_per_user_per_job
    ON apply_form_user_to_job (job_id, user_id);


-- ============================================================
-- A6: Resync denormalized counters (one-time correction)
-- ============================================================

-- Resync Job.application_count
UPDATE job j
SET application_count = COALESCE((
    SELECT COUNT(*) FROM apply_form_user_to_job afj WHERE afj.job_id = j.id
), 0);

-- Resync Job.current_accepted
UPDATE job j
SET current_accepted = COALESCE((
    SELECT COUNT(*)
    FROM apply_form_user_to_job afj
    WHERE afj.job_id = j.id AND afj.status = 'ACCEPTED'
), 0);

-- Resync Company.follower_count
UPDATE company c
SET follower_count = COALESCE((
    SELECT COUNT(*) FROM user_follow_company ufc WHERE ufc.company_id = c.company_id
), 0);

-- DB trigger: keep Company.follower_count in sync on follow/unfollow
-- (service layer does not update this field directly)
CREATE OR REPLACE FUNCTION fn_sync_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE company
        SET follower_count = COALESCE(follower_count, 0) + 1
        WHERE company_id = NEW.company_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE company
        SET follower_count = GREATEST(COALESCE(follower_count, 0) - 1, 0)
        WHERE company_id = OLD.company_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_follower_count ON user_follow_company;
CREATE TRIGGER trg_sync_follower_count
    AFTER INSERT OR DELETE ON user_follow_company
    FOR EACH ROW EXECUTE FUNCTION fn_sync_follower_count();


-- ============================================================
-- A9: Company.info_source_affiliation_id FK
-- Prevents dangling references to deleted affiliations.
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_company_info_source_affiliation'
    ) THEN
        ALTER TABLE company
            ADD CONSTRAINT fk_company_info_source_affiliation
                FOREIGN KEY (info_source_affiliation_id)
                REFERENCES company_hr_affiliations(id) ON DELETE SET NULL;
    END IF;
END;
$$;


-- ============================================================
-- A16: Category self-reference FK (parentId → categories.id)
-- Prevents orphaned subcategories when a parent is deleted.
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_category_parent'
    ) THEN
        ALTER TABLE categories
            ADD CONSTRAINT fk_category_parent
                FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END;
$$;
