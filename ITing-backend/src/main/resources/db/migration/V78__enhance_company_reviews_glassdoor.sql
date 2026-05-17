-- Extend company_reviews with Glassdoor-style fields.
ALTER TABLE company_reviews
    ADD COLUMN IF NOT EXISTS title VARCHAR(200),
    ADD COLUMN IF NOT EXISTS pros TEXT,
    ADD COLUMN IF NOT EXISTS cons TEXT,
    ADD COLUMN IF NOT EXISTS work_type VARCHAR(20),                  -- CURRENT_EMPLOYEE | FORMER_EMPLOYEE | INTERN | CONTRACTOR
    ADD COLUMN IF NOT EXISTS job_title VARCHAR(150),                 -- reviewer's role (display only)
    ADD COLUMN IF NOT EXISTS work_years INT,                         -- 0..N years
    ADD COLUMN IF NOT EXISTS salary_range_min NUMERIC(15, 2),
    ADD COLUMN IF NOT EXISTS salary_range_max NUMERIC(15, 2),
    ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN,
    ADD COLUMN IF NOT EXISTS culture_rating INT,                     -- 1..5
    ADD COLUMN IF NOT EXISTS work_life_balance_rating INT,
    ADD COLUMN IF NOT EXISTS career_growth_rating INT,
    ADD COLUMN IF NOT EXISTS salary_benefits_rating INT,
    ADD COLUMN IF NOT EXISTS management_rating INT,
    ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS helpful_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS report_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING | APPROVED | REJECTED
    ADD COLUMN IF NOT EXISTS moderator_note VARCHAR(500),
    ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS moderated_by BIGINT;

-- Helpfulness votes (one user can helpful-vote each review once)
CREATE TABLE IF NOT EXISTS company_review_votes (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    voted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_vote_review FOREIGN KEY (review_id) REFERENCES company_reviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_vote_account FOREIGN KEY (account_id) REFERENCES Account(Id) ON DELETE CASCADE,
    CONSTRAINT uq_review_vote_user UNIQUE (review_id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_company_review_moderation
    ON company_reviews (moderation_status, created_at DESC);
