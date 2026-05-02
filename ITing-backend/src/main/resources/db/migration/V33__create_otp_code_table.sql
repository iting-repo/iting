CREATE TABLE otp_code (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    is_verification BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_otp_code_email ON otp_code(email);
