-- ======================================
-- V55: Create env_configs table
-- Dynamic environment variable management
-- ======================================

CREATE TABLE IF NOT EXISTS env_configs (
    id                BIGSERIAL PRIMARY KEY,
    env_key           VARCHAR(128)  NOT NULL UNIQUE,
    env_value         TEXT,
    env_group         VARCHAR(32)   DEFAULT 'app',
    description       VARCHAR(512),
    sensitive         BOOLEAN       DEFAULT false,
    value_type        VARCHAR(16)   DEFAULT 'string',
    last_updated_by   BIGINT,
    last_update       TIMESTAMP
);

CREATE INDEX idx_env_configs_group ON env_configs(env_group);
CREATE INDEX idx_env_configs_key   ON env_configs(env_key);
