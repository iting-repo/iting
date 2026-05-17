-- Referral program: 1 user → 1 unique code; track successful conversions.
CREATE TABLE IF NOT EXISTS referral_codes (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    total_invited INT NOT NULL DEFAULT 0,
    total_signups INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_referral_code_account FOREIGN KEY (account_id) REFERENCES Account(Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_referral_code_lookup ON referral_codes (code);

-- Track each individual referral signup (referrer → referred)
CREATE TABLE IF NOT EXISTS referrals (
    id BIGSERIAL PRIMARY KEY,
    referrer_id BIGINT NOT NULL,           -- người mời
    referred_account_id BIGINT NOT NULL UNIQUE,  -- người được mời (mỗi người được mời 1 lần duy nhất)
    code_used VARCHAR(20) NOT NULL,
    signup_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    first_application_at TIMESTAMP,        -- conversion event
    rewarded BOOLEAN NOT NULL DEFAULT FALSE,
    rewarded_at TIMESTAMP,
    reward_note VARCHAR(255),
    CONSTRAINT fk_referral_referrer FOREIGN KEY (referrer_id) REFERENCES Account(Id) ON DELETE CASCADE,
    CONSTRAINT fk_referral_referred FOREIGN KEY (referred_account_id) REFERENCES Account(Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_rewarded ON referrals (rewarded) WHERE rewarded = FALSE;
