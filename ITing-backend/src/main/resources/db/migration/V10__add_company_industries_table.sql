-- ============================================================================
-- Add company_industries table for ElementCollection mapping
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_industries (
    company_id BIGINT NOT NULL,
    industry VARCHAR(255) NOT NULL,
    CONSTRAINT fk_company_industries_company FOREIGN KEY (company_id) REFERENCES Company(company_id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_company_industries_company_id ON company_industries(company_id);
