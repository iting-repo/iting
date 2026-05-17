-- VAT-compliant invoices for payment orders.
CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    payment_order_id BIGINT NOT NULL UNIQUE,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,         -- e.g. ITI-2026-00001 (format-controlled)
    account_id BIGINT NOT NULL,

    -- Billing party (set by user/HR when requesting invoice)
    bill_to_name VARCHAR(255) NOT NULL,                 -- "Cá nhân" or company name
    bill_to_tax_code VARCHAR(20),                       -- empty for individual; required for company
    bill_to_address VARCHAR(500),
    bill_to_email VARCHAR(255),

    -- Amount breakdown (VAT 10% standard in VN)
    amount_excl_vat BIGINT NOT NULL,                    -- amount before VAT
    vat_rate INT NOT NULL DEFAULT 10,                   -- percentage
    vat_amount BIGINT NOT NULL,
    total_amount BIGINT NOT NULL,                       -- = excl_vat + vat_amount

    item_description VARCHAR(255) NOT NULL,             -- e.g. "Boost job 7 ngày — Job ID 123"

    pdf_s3_url VARCHAR(500),                            -- S3 URL of generated PDF
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoice_order FOREIGN KEY (payment_order_id) REFERENCES payment_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_account FOREIGN KEY (account_id) REFERENCES Account(Id) ON DELETE CASCADE
);

-- Yearly counter for invoice numbering
CREATE TABLE IF NOT EXISTS invoice_sequence (
    year INT PRIMARY KEY,
    last_number INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_invoices_account ON invoices (account_id, issued_at DESC);
