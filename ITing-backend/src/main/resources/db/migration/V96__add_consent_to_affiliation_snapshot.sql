-- ============================================================
-- V96: Gộp consent document vào affiliation snapshot
-- Option B: HR upload consent qua affiliation flow, admin duyệt
-- trong cùng endpoint /api/admin/affiliations/{id}/approve.
-- ============================================================

ALTER TABLE company_hr_affiliations
    ADD COLUMN IF NOT EXISTS submitted_consent_url       TEXT,
    ADD COLUMN IF NOT EXISTS submitted_consent_confirmed BOOLEAN DEFAULT FALSE NOT NULL;

-- Backfill: nếu Company đã có consent APPROVED, copy sang info_source affiliation
-- (HR gốc) để không phải re-upload.
UPDATE company_hr_affiliations aff
SET    submitted_consent_url       = c.consent_document_file_url,
       submitted_consent_confirmed = COALESCE(c.consent_document_confirmed, FALSE)
FROM   company c
WHERE  c.info_source_affiliation_id = aff.id
  AND  c.consent_document_file_url IS NOT NULL;
