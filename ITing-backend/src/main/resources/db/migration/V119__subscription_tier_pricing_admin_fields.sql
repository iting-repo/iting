-- Cho phép admin tạo / quản lý nhiều gói HR tùy ý (không còn khóa cứng theo enum).
-- Thêm các cột phục vụ hiển thị (thứ tự, badge, màu nhấn, gói nổi bật) và feature-gate
-- (talent_pool) để mỗi gói tự khai báo quyền lợi thay vì hardcode theo code.
ALTER TABLE subscription_tier_pricing
    ADD COLUMN IF NOT EXISTS sort_order   INTEGER     NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS popular      BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS talent_pool  BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS badge        VARCHAR(50),
    ADD COLUMN IF NOT EXISTS accent_color VARCHAR(20);

-- Seed giá trị hợp lý cho 3 gói gốc (khớp giao diện hiện tại).
UPDATE subscription_tier_pricing
   SET sort_order = 1, accent_color = '#3AB4E6'
 WHERE code = 'BASIC';

UPDATE subscription_tier_pricing
   SET sort_order = 2, popular = TRUE, talent_pool = TRUE,
       badge = 'PHỔ BIẾN NHẤT', accent_color = '#F59E0B'
 WHERE code = 'PRO';

UPDATE subscription_tier_pricing
   SET sort_order = 3, talent_pool = TRUE,
       badge = 'DOANH NGHIỆP', accent_color = '#8B5CF6'
 WHERE code = 'ENTERPRISE';
