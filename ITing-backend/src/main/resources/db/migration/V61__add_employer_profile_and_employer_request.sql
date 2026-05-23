-- V61: Add employer_profiles, employer_requests tables
CREATE TABLE IF NOT EXISTS employer_profiles (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    company_id BIGINT REFERENCES company(company_id) ON DELETE SET NULL,
    position VARCHAR(255),
    department VARCHAR(255),
    phone VARCHAR(50),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id)
);

CREATE TABLE IF NOT EXISTS employer_requests (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    company_id BIGINT REFERENCES company(company_id) ON DELETE SET NULL,
    company_name VARCHAR(255),
    position VARCHAR(255),
    department VARCHAR(255),
    phone VARCHAR(50),
    message TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    reviewed_by BIGINT REFERENCES account(id),
    reviewed_at TIMESTAMP,
    reject_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
