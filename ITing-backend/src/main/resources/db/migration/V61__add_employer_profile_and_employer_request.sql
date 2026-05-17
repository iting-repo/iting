-- V61: Add employer_profiles, employer_requests tables and admin_level to admin_accounts

-- Bảng profile riêng của Employer (HR), share PK với Account
CREATE TABLE employer_profiles (
    id BIGINT PRIMARY KEY REFERENCES account(id),
    position VARCHAR(100),
    verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- Bảng yêu cầu Employer xin xác nhận thuộc về một Company
CREATE TABLE employer_requests (
    id BIGSERIAL PRIMARY KEY,
    employer_id BIGINT NOT NULL REFERENCES employer_profiles(id),
    company_id BIGINT NOT NULL REFERENCES company(company_id),
    reviewed_by BIGINT REFERENCES admin_accounts(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    request_message TEXT,
    admin_note TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employer_requests_employer ON employer_requests(employer_id);
CREATE INDEX idx_employer_requests_company  ON employer_requests(company_id);
CREATE INDEX idx_employer_requests_status   ON employer_requests(status);

-- Thêm cột phân cấp admin vào admin_accounts
ALTER TABLE admin_accounts
    ADD COLUMN IF NOT EXISTS admin_level VARCHAR(20) NOT NULL DEFAULT 'MODERATOR';
