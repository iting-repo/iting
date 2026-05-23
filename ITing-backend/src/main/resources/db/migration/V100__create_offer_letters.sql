-- ============================================================
-- V100: Offer Letter management (Phase B)
-- Một application có thể có nhiều offer theo thời gian (revoke + tạo lại).
-- Chỉ 1 offer "active" (SENT) tại một thời điểm cho mỗi application.
-- ============================================================

CREATE TABLE IF NOT EXISTS offer_letters (
    id                      BIGSERIAL PRIMARY KEY,
    apply_form_id           BIGINT       NOT NULL,
    job_id                  BIGINT       NOT NULL,
    candidate_account_id    BIGINT       NOT NULL,
    company_id              BIGINT       NOT NULL,
    created_by_hr_id        BIGINT       NOT NULL,

    -- Offer terms
    position                VARCHAR(255) NOT NULL,
    salary_amount           NUMERIC(15, 2),
    salary_currency         VARCHAR(10)  DEFAULT 'VND',
    salary_type             VARCHAR(20)  DEFAULT 'MONTH',  -- MONTH / YEAR
    start_date              DATE,
    expires_at              TIMESTAMP    NOT NULL,
    notes                   TEXT,

    -- Lifecycle
    status                  VARCHAR(20)  NOT NULL DEFAULT 'SENT',
    pdf_file_url            TEXT,
    sent_at                 TIMESTAMP    NOT NULL DEFAULT NOW(),
    responded_at            TIMESTAMP,
    revoked_at              TIMESTAMP,
    candidate_response_note TEXT,

    created_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_offer_status CHECK (status IN ('SENT','ACCEPTED','DECLINED','REVOKED','EXPIRED')),
    CONSTRAINT chk_offer_salary_type CHECK (salary_type IN ('MONTH','YEAR'))
);

CREATE INDEX IF NOT EXISTS idx_offer_apply_form     ON offer_letters(apply_form_id);
CREATE INDEX IF NOT EXISTS idx_offer_job            ON offer_letters(job_id);
CREATE INDEX IF NOT EXISTS idx_offer_candidate      ON offer_letters(candidate_account_id);
CREATE INDEX IF NOT EXISTS idx_offer_status         ON offer_letters(status);
CREATE INDEX IF NOT EXISTS idx_offer_company        ON offer_letters(company_id);

-- Chỉ 1 offer SENT tại một thời điểm cho cặp (apply_form_id, job_id) — chống tạo trùng
CREATE UNIQUE INDEX IF NOT EXISTS uniq_offer_active_per_application
    ON offer_letters(apply_form_id, job_id)
 WHERE status = 'SENT';
