-- =====================================================
-- V58: Restructure candidate_profiles table
-- =====================================================

-- 1. Add new columns
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS show_email_to_recruiter BOOLEAN DEFAULT false;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS show_phone_to_recruiter BOOLEAN DEFAULT false;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 2. Migrate data from account table
UPDATE candidate_profiles cp
SET user_id = cp.id,
    full_name = a.full_name,
    avatar_url = a.avatar_url,
    phone_number = a.phone
FROM account a
WHERE cp.id = a.id;

-- 3. Migrate short_bio -> bio
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'candidate_profiles' AND column_name = 'short_bio') THEN
        UPDATE candidate_profiles SET bio = short_bio WHERE bio IS NULL AND short_bio IS NOT NULL;
    END IF;
END $$;

-- 4. Migrate contact_info phone
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_info') THEN
        UPDATE candidate_profiles cp
        SET phone_number = ci.phone
        FROM contact_info ci
        WHERE cp.id = ci.id AND (cp.phone_number IS NULL OR cp.phone_number = '');
    END IF;
END $$;

-- 5. Rename is_open_to_work -> open_to_work
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'candidate_profiles' AND column_name = 'is_open_to_work') THEN
        ALTER TABLE candidate_profiles RENAME COLUMN is_open_to_work TO open_to_work;
    END IF;
END $$;

-- 6. FK + unique index
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_profile_account') THEN
        ALTER TABLE candidate_profiles
            ADD CONSTRAINT fk_profile_account
            FOREIGN KEY (user_id) REFERENCES account(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_user_id ON candidate_profiles(user_id);

-- 7. Drop old columns
ALTER TABLE candidate_profiles DROP COLUMN IF EXISTS short_bio;
ALTER TABLE candidate_profiles DROP COLUMN IF EXISTS total_experience_years;
ALTER TABLE candidate_profiles DROP COLUMN IF EXISTS education_summary;
ALTER TABLE candidate_profiles DROP COLUMN IF EXISTS employment_status;

-- 8. Drop contact_info table
DROP TABLE IF EXISTS contact_info CASCADE;
