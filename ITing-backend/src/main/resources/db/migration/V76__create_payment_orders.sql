-- Payment orders (bank transfer via SEPAY).
-- Status: PENDING (waiting for webhook), PAID (confirmed), EXPIRED, CANCELED, FAILED.
CREATE TABLE IF NOT EXISTS payment_orders (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    order_code VARCHAR(40) NOT NULL UNIQUE,         -- printed in transfer description
    amount BIGINT NOT NULL,                          -- VND, integer
    description VARCHAR(255),

    -- What is being purchased
    item_type VARCHAR(30) NOT NULL,                  -- BOOST_JOB | PREMIUM_MONTHLY | etc.
    item_id BIGINT,                                  -- e.g. job_id when item_type=BOOST_JOB
    tier VARCHAR(20),                                -- BOOST_7D | BOOST_14D | BOOST_30D

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    -- Payment gateway info
    gateway VARCHAR(20) NOT NULL DEFAULT 'SEPAY',
    sepay_transaction_id VARCHAR(100),
    sepay_gateway_name VARCHAR(50),                  -- e.g. Vietcombank, Techcombank
    paid_amount BIGINT,                              -- actual amount transferred
    paid_at TIMESTAMP,
    raw_webhook_payload TEXT,

    expires_at TIMESTAMP NOT NULL,                   -- order expires if unpaid by this time
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_order_account FOREIGN KEY (account_id) REFERENCES Account(Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_account ON payment_orders (account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status_expires
    ON payment_orders (status, expires_at) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_code ON payment_orders (order_code);
