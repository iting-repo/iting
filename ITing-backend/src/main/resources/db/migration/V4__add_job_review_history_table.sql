CREATE TABLE job_review_history (
    id BIGSERIAL PRIMARY KEY,

    job_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP NOT NULL,
    note TEXT,

    CONSTRAINT fk_job_review_history_job
        FOREIGN KEY (job_id) REFERENCES Job(Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_job_review_history_job_id
    ON job_review_history(job_id);

CREATE INDEX IF NOT EXISTS idx_job_review_history_action
    ON job_review_history(action);

CREATE INDEX IF NOT EXISTS idx_job_review_history_timestamp
    ON job_review_history("timestamp");

CREATE INDEX IF NOT EXISTS idx_job_review_history_job_timestamp
    ON job_review_history(job_id, "timestamp" DESC);