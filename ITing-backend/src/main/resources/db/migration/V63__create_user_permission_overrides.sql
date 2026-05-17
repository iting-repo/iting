CREATE TABLE user_permission_overrides (
    id          BIGSERIAL PRIMARY KEY,
    account_id  BIGINT NOT NULL,
    permission_key VARCHAR(100) NOT NULL,
    granted     BOOLEAN NOT NULL DEFAULT true,
    granted_by  BIGINT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_upo_account    FOREIGN KEY (account_id) REFERENCES Account(Id) ON DELETE CASCADE,
    CONSTRAINT fk_upo_granted_by FOREIGN KEY (granted_by) REFERENCES Account(Id) ON DELETE SET NULL,
    CONSTRAINT uq_upo_account_permission UNIQUE (account_id, permission_key)
);

CREATE INDEX idx_upo_account_id ON user_permission_overrides(account_id);
