-- Create company_reviews table for company rating/review system
CREATE TABLE IF NOT EXISTS company_reviews (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_company FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_account FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_company_reviews_company_id ON company_reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_account_id ON company_reviews(account_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_created_at ON company_reviews(created_at DESC);
