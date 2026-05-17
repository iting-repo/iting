-- Newsletter subscriptions (independent of Account — anonymous users can subscribe too)
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    source VARCHAR(50) NOT NULL DEFAULT 'FOOTER',  -- FOOTER | POPUP | LEAD_MAGNET | EXIT_INTENT
    lead_magnet VARCHAR(100),                       -- e.g. 'salary-report-2026'
    unsubscribe_token VARCHAR(64) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    last_sent_at TIMESTAMP,
    -- Attribution
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(200),
    ip_address VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_active
    ON newsletter_subscriptions (unsubscribed_at)
    WHERE unsubscribed_at IS NULL;
