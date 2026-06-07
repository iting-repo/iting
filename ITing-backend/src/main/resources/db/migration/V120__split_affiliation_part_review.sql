-- V120: Tách review affiliation thành 3 phần độc lập (info / license / consent).
-- HR gửi duyệt từng phần riêng; admin duyệt/từ chối từng phần. Khi cả 3 = APPROVED,
-- admin gán HR vào một công ty cụ thể (assign-to-company, có thể ghi đè company_id).
-- Mỗi part dùng cùng tập trạng thái với SubmissionStatus: NONE/DRAFT/PENDING_REVIEW/APPROVED/REJECTED.
ALTER TABLE company_hr_affiliations
    ADD COLUMN IF NOT EXISTS info_status           VARCHAR(20) NOT NULL DEFAULT 'NONE',
    ADD COLUMN IF NOT EXISTS license_status        VARCHAR(20) NOT NULL DEFAULT 'NONE',
    ADD COLUMN IF NOT EXISTS consent_status        VARCHAR(20) NOT NULL DEFAULT 'NONE',
    ADD COLUMN IF NOT EXISTS info_reject_reason     TEXT,
    ADD COLUMN IF NOT EXISTS license_reject_reason  TEXT,
    ADD COLUMN IF NOT EXISTS consent_reject_reason  TEXT;

-- Backfill: các affiliation đã APPROVED trước đây coi như cả 3 phần đã được duyệt.
UPDATE company_hr_affiliations
SET info_status    = 'APPROVED',
    license_status = 'APPROVED',
    consent_status = 'APPROVED'
WHERE submission_status = 'APPROVED';
