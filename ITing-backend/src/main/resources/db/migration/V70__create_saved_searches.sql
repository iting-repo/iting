-- Saved searches with optional email alerts (daily/weekly digest of new matching jobs)
CREATE TABLE IF NOT EXISTS saved_searches (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    keyword VARCHAR(255),
    location VARCHAR(255),
    job_type VARCHAR(30),
    experience_level VARCHAR(30),
    min_salary NUMERIC(15, 2),
    max_salary NUMERIC(15, 2),
    email_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    alert_frequency VARCHAR(20) NOT NULL DEFAULT 'DAILY',  -- DAILY | WEEKLY | NEVER
    last_alert_sent_at TIMESTAMP,
    last_matched_job_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_search_account FOREIGN KEY (account_id) REFERENCES Account(Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_search_account_id ON saved_searches(account_id);
CREATE INDEX IF NOT EXISTS idx_saved_search_alerts ON saved_searches(email_alerts_enabled, alert_frequency, last_alert_sent_at)
    WHERE email_alerts_enabled = TRUE;
