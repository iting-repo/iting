ALTER TABLE Company ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE Company ADD COLUMN IF NOT EXISTS Document_review_status VARCHAR(50) DEFAULT 'MISSING';
ALTER TABLE Company ADD COLUMN IF NOT EXISTS Profile_setup BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS company_tech_stack (
    company_id BIGINT NOT NULL,
    tech VARCHAR(255),
    CONSTRAINT fk_tech_stack_company FOREIGN KEY (company_id) REFERENCES Company(company_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS company_benefits (
    company_id BIGINT NOT NULL,
    benefit VARCHAR(255),
    CONSTRAINT fk_benefits_company FOREIGN KEY (company_id) REFERENCES Company(company_id) ON DELETE CASCADE
);

UPDATE Company
SET Document_review_status = COALESCE(Document_review_status, 'MISSING'),
    Profile_setup = COALESCE(Profile_setup, FALSE);
