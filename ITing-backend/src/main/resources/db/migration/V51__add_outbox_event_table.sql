-- V51: Outbox pattern for transactional Kafka publishing.
-- Producers INSERT into this table inside the same DB transaction as the domain change.
-- A scheduled dispatcher polls UNSENT rows, publishes to Kafka, marks SENT.

CREATE TABLE IF NOT EXISTS postgres.outbox_event (
    id            BIGSERIAL PRIMARY KEY,
    event_id      VARCHAR(64)  NOT NULL UNIQUE,
    aggregate     VARCHAR(64)  NOT NULL,
    aggregate_key VARCHAR(128) NOT NULL,
    topic         VARCHAR(128) NOT NULL,
    payload       TEXT         NOT NULL,
    type_info     VARCHAR(255) NOT NULL,
    status        VARCHAR(16)  NOT NULL DEFAULT 'PENDING',
    attempts      INT          NOT NULL DEFAULT 0,
    last_error    TEXT,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at       TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending
    ON postgres.outbox_event (status, created_at)
    WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_outbox_aggregate
    ON postgres.outbox_event (aggregate, aggregate_key);
