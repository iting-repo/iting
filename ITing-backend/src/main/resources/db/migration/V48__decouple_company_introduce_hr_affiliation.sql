-- =============================================================================
-- V48 — Decouple Company from Account, introduce N-HR-per-Company affiliation
-- =============================================================================
-- Phase 1 (additive): tạo bảng affiliation, cột mới ở Company/Job, backfill data.
-- KHÔNG drop FK cũ, KHÔNG NOT NULL/UNIQUE tax_code (defer Phase 2).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────
-- 1) Bảng affiliation
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE company_hr_affiliations (
    id                          BIGSERIAL PRIMARY KEY,
    hr_account_id               BIGINT      NOT NULL,
    company_id                  BIGINT      NOT NULL,
    -- Membership
    status                      VARCHAR(20) NOT NULL,
    rejected_reason             TEXT,
    requested_at                TIMESTAMP   NOT NULL DEFAULT NOW(),
    reviewed_at                 TIMESTAMP,
    reviewed_by                 BIGINT,
    -- Snapshot fields (HR submitted via FoundingInfoTab)
    submitted_name              VARCHAR(255),
    submitted_logo_url          TEXT,
    submitted_description       TEXT,
    submitted_website           TEXT,
    submitted_address           VARCHAR(500),
    submitted_industries        TEXT,
    submitted_company_size      VARCHAR(50),
    submitted_phone             VARCHAR(20),
    submitted_company_email     VARCHAR(255),
    submitted_license_url       TEXT,
    -- Submission review
    submission_status           VARCHAR(20) NOT NULL DEFAULT 'NONE',
    submission_submitted_at     TIMESTAMP,
    submission_reviewed_at      TIMESTAMP,
    submission_reviewed_by      BIGINT,
    submission_reject_reason    TEXT,
    applied_to_company_at       TIMESTAMP,
    -- Audit (AuditEntity)
    created_at                  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_aff_hr      FOREIGN KEY (hr_account_id) REFERENCES account(id) ON DELETE CASCADE,
    CONSTRAINT fk_aff_company FOREIGN KEY (company_id)    REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT chk_aff_status CHECK (status IN ('INCOMPLETE','PENDING','APPROVED','REJECTED','REVOKED')),
    CONSTRAINT chk_sub_status CHECK (submission_status IN ('NONE','DRAFT','PENDING_REVIEW','APPROVED','REJECTED'))
);

CREATE INDEX idx_aff_hr         ON company_hr_affiliations(hr_account_id);
CREATE INDEX idx_aff_company    ON company_hr_affiliations(company_id);
CREATE INDEX idx_aff_status     ON company_hr_affiliations(status);
CREATE INDEX idx_aff_sub_status ON company_hr_affiliations(submission_status);

-- 1 HR chỉ có 1 affiliation đang INCOMPLETE/PENDING/APPROVED tại 1 thời điểm
CREATE UNIQUE INDEX uniq_aff_active
    ON company_hr_affiliations(hr_account_id)
    WHERE status IN ('INCOMPLETE','PENDING','APPROVED');

-- ─────────────────────────────────────────────────────────────────
-- 2) Cột mới ở Company
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE company ADD COLUMN info_source_affiliation_id BIGINT;
-- FK thêm sau khi seed (mục 5)

-- ─────────────────────────────────────────────────────────────────
-- 3) Cột mới ở Job
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE job ADD COLUMN posted_by_hr_id BIGINT;
ALTER TABLE job
    ADD CONSTRAINT fk_job_posted_by_hr
    FOREIGN KEY (posted_by_hr_id) REFERENCES account(id);
CREATE INDEX idx_job_posted_by_hr ON job(posted_by_hr_id);

-- ─────────────────────────────────────────────────────────────────
-- 4) Backfill: mọi Account role 'COMPANY' / 'EMPLOYER' đã có Company
--    → tạo Affiliation status=APPROVED, snapshot copy từ Company hiện có.
--    KHÔNG đổi role 'COMPANY' ở account ở phase này (defer Phase 2).
-- ─────────────────────────────────────────────────────────────────
INSERT INTO company_hr_affiliations (
    hr_account_id, company_id,
    status, requested_at, reviewed_at, reviewed_by,
    submitted_name, submitted_logo_url, submitted_description,
    submitted_website, submitted_address, submitted_industries,
    submitted_company_size, submitted_phone, submitted_company_email,
    submitted_license_url,
    submission_status, submission_submitted_at, submission_reviewed_at,
    applied_to_company_at,
    created_at, updated_at
)
SELECT
    c.company_id                                                 AS hr_account_id,
    c.company_id                                                 AS company_id,
    'APPROVED'                                                   AS status,
    COALESCE(c.last_update, NOW())                               AS requested_at,
    NOW()                                                        AS reviewed_at,
    NULL                                                         AS reviewed_by,
    c.name                                                       AS submitted_name,
    c.logo                                                       AS submitted_logo_url,
    c.description                                                AS submitted_description,
    c.web_link                                                   AS submitted_website,
    c.address                                                    AS submitted_address,
    -- Backfill industries thành JSON array string từ bảng company_industries
    (
        SELECT CASE
                   WHEN COUNT(*) = 0 THEN NULL
                   ELSE '["' || string_agg(industry, '","' ORDER BY industry) || '"]'
               END
          FROM company_industries ci
         WHERE ci.company_id = c.company_id
    )                                                            AS submitted_industries,
    c.company_size                                               AS submitted_company_size,
    c.phone                                                      AS submitted_phone,
    c.company_email                                              AS submitted_company_email,
    c.business_license_file_url                                  AS submitted_license_url,
    'APPROVED'                                                   AS submission_status,
    COALESCE(c.last_update, NOW())                               AS submission_submitted_at,
    NOW()                                                        AS submission_reviewed_at,
    NOW()                                                        AS applied_to_company_at,
    NOW()                                                        AS created_at,
    NOW()                                                        AS updated_at
FROM   company c
WHERE  EXISTS (SELECT 1 FROM account a WHERE a.id = c.company_id);

-- ─────────────────────────────────────────────────────────────────
-- 5) Set info_source_affiliation_id = affiliation vừa tạo cho mỗi Company
-- ─────────────────────────────────────────────────────────────────
UPDATE company c
   SET info_source_affiliation_id = (
       SELECT a.id FROM company_hr_affiliations a
        WHERE a.company_id = c.company_id
          AND a.status = 'APPROVED'
        ORDER BY a.id LIMIT 1
   )
 WHERE EXISTS (SELECT 1 FROM account a WHERE a.id = c.company_id);

ALTER TABLE company
    ADD CONSTRAINT fk_company_info_source
    FOREIGN KEY (info_source_affiliation_id) REFERENCES company_hr_affiliations(id);

-- ─────────────────────────────────────────────────────────────────
-- 6) Backfill posted_by_hr_id cho Job (= company_id vì schema cũ Company.id == Account.id)
-- ─────────────────────────────────────────────────────────────────
UPDATE job SET posted_by_hr_id = company_id WHERE posted_by_hr_id IS NULL;

-- =============================================================================
-- KẾT THÚC V48 (Phase 1 — additive only).
--
-- Phase 2 (V49) sẽ:
--   * UPDATE account SET role='EMPLOYER' WHERE role='COMPANY';
--   * ALTER company DROP CONSTRAINT fk_company_account (FK @MapsId cũ);
--   * Dedup tax_code + ALTER company tax_code SET NOT NULL + UNIQUE;
-- =============================================================================
