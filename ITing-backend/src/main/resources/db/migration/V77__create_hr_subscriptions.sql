-- HR Premium Subscription (recurring monthly/yearly).
-- One active subscription per account at a time (unique index when status=ACTIVE).
CREATE TABLE IF NOT EXISTS hr_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    tier VARCHAR(30) NOT NULL,                       -- BASIC | PRO | ENTERPRISE
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',    -- ACTIVE | EXPIRED | CANCELED | PENDING_RENEWAL
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    last_payment_order_id BIGINT,
    canceled_at TIMESTAMP,
    cancel_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subscription_account FOREIGN KEY (account_id) REFERENCES Account(Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subscription_account ON hr_subscriptions (account_id, status);
CREATE INDEX IF NOT EXISTS idx_subscription_renewal
    ON hr_subscriptions (expires_at, auto_renew)
    WHERE status = 'ACTIVE' AND auto_renew = TRUE;
