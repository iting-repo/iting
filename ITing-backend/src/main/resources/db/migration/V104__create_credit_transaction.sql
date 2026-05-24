-- V104: Audit ledger cho mọi grant/consume credits.
-- Account.credits là balance hiện tại; bảng này lưu lịch sử để truy vết.

CREATE TABLE IF NOT EXISTS credit_transaction (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,           -- dương = grant, âm = consume
    balance_after INTEGER NOT NULL,    -- snapshot balance sau giao dịch
    source VARCHAR(50) NOT NULL,       -- SUBSCRIPTION | JOB_POST | JOB_BOOST | ADJUSTMENT | REFUND
    reference_id BIGINT,               -- id liên quan (subscription_id, job_id, order_id…)
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_account_time
    ON credit_transaction(account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_tx_source
    ON credit_transaction(source, created_at DESC);
