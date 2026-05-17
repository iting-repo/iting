-- Marketing attribution: track how a user discovered ITing.
-- All fields nullable — old accounts simply have NULL (no breaking change).
ALTER TABLE Account
    ADD COLUMN IF NOT EXISTS utm_source     VARCHAR(100),
    ADD COLUMN IF NOT EXISTS utm_medium     VARCHAR(100),
    ADD COLUMN IF NOT EXISTS utm_campaign   VARCHAR(200),
    ADD COLUMN IF NOT EXISTS utm_term       VARCHAR(200),
    ADD COLUMN IF NOT EXISTS utm_content    VARCHAR(200),
    ADD COLUMN IF NOT EXISTS referrer_url   VARCHAR(500),
    ADD COLUMN IF NOT EXISTS landing_page   VARCHAR(500),
    ADD COLUMN IF NOT EXISTS signup_ip      VARCHAR(64),
    ADD COLUMN IF NOT EXISTS signup_user_agent VARCHAR(500);

-- Index for funnel queries (group by source/campaign)
CREATE INDEX IF NOT EXISTS idx_account_utm_source ON Account (utm_source);
CREATE INDEX IF NOT EXISTS idx_account_utm_campaign ON Account (utm_campaign);
