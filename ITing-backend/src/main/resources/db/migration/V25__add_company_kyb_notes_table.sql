-- Migration for Company KYB Notes table
CREATE TABLE company_kyb_notes (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,
    note_content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_company_kyb_notes_company FOREIGN KEY (company_id) REFERENCES Company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_company_kyb_notes_admin FOREIGN KEY (admin_id) REFERENCES Account(Id) ON DELETE CASCADE
);

CREATE INDEX idx_company_kyb_notes_company_id ON company_kyb_notes(company_id);
CREATE INDEX idx_company_kyb_notes_admin_id ON company_kyb_notes(admin_id);
