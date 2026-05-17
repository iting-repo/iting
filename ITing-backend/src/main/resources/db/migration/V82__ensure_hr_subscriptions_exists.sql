-- Ensure hr_subscriptions table exists (fixes V77 migration that may have been skipped due to version conflict).
CREATE TABLE IF NOT EXISTS hr_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    tier VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    last_payment_order_id BIGINT,
    canceled_at TIMESTAMP,
    cancel_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add FK only if not exists (safe with DO block)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_subscription_account') THEN
        ALTER TABLE hr_subscriptions
            ADD CONSTRAINT fk_subscription_account
            FOREIGN KEY (account_id) REFERENCES Account(Id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscription_account ON hr_subscriptions (account_id, status);
CREATE INDEX IF NOT EXISTS idx_subscription_renewal
    ON hr_subscriptions (expires_at, auto_renew)
    WHERE status = 'ACTIVE' AND auto_renew = TRUE;
