-- DB-driven pricing cho gói HR Premium.
-- Trước đây giá nằm hardcode trong enum SubscriptionTier → muốn đổi giá phải redeploy.
-- Bảng này cho phép admin chỉnh giá / quyền lợi / quota qua trang quản trị mà không cần build lại.
-- Service đọc giá hiệu lực ở đây; nếu thiếu row thì fallback về default trong enum.
CREATE TABLE IF NOT EXISTS subscription_tier_pricing (
    code                 VARCHAR(30) PRIMARY KEY,            -- BASIC | PRO | ENTERPRISE (khớp enum SubscriptionTier)
    display_name         VARCHAR(255) NOT NULL,
    price_vnd            BIGINT       NOT NULL,
    period_days          INTEGER      NOT NULL DEFAULT 30,
    credits              INTEGER      NOT NULL DEFAULT 0,     -- credits cộng khi kích hoạt
    benefits             VARCHAR(1000) NOT NULL DEFAULT '',   -- các quyền lợi, phân tách bằng dấu '·'
    max_jobs_per_month   INTEGER      NOT NULL DEFAULT 0,     -- -1 = không giới hạn
    max_boosts_per_month INTEGER      NOT NULL DEFAULT 0,     -- -1 = không giới hạn
    active               BOOLEAN      NOT NULL DEFAULT TRUE,  -- false = ẩn khỏi bảng giá public
    updated_by           BIGINT,                              -- admin account id chỉnh lần cuối
    created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed bằng đúng giá trị default đang nằm trong enum SubscriptionTier.
INSERT INTO subscription_tier_pricing
    (code, display_name, price_vnd, period_days, credits, benefits, max_jobs_per_month, max_boosts_per_month, active)
VALUES
    ('BASIC', 'Basic — 199.000đ / tháng', 199000, 30, 50,
     'Đăng 10 job/tháng · 5 boost mỗi tháng · Email support', 10, 5, TRUE),
    ('PRO', 'Pro — 499.000đ / tháng', 499000, 30, 200,
     'Đăng 50 job/tháng · 20 boost · Talent pool search · Priority support · Analytics', 50, 20, TRUE),
    ('ENTERPRISE', 'Enterprise — 1.499.000đ / tháng', 1499000, 30, 1000,
     'Không giới hạn job · Bulk boost · AI auto-screening · Dedicated CSM · SLA 99.9%', -1, -1, TRUE)
ON CONFLICT (code) DO NOTHING;
