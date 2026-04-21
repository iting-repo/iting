-- Migration to add extra fields to Company table and support tables for tech stack and benefits
-- March 16, 2026

-- 1. Add founded_year column
ALTER TABLE Company ADD COLUMN founded_year INTEGER;

-- 2. Create company_tech_stack table
CREATE TABLE company_tech_stack (
    company_id BIGINT NOT NULL,
    tech VARCHAR(255),
    CONSTRAINT fk_tech_stack_company FOREIGN KEY (company_id) REFERENCES Account(Id) ON DELETE CASCADE
);

-- 3. Create company_benefits table
CREATE TABLE company_benefits (
    company_id BIGINT NOT NULL,
    benefit VARCHAR(255),
    CONSTRAINT fk_benefits_company FOREIGN KEY (company_id) REFERENCES Account(Id) ON DELETE CASCADE
);
