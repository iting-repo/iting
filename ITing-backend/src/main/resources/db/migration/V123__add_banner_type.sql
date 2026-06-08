-- V123: Thêm "Loại banner" để phân biệt mục đích sử dụng.
--   ADVERTISEMENT = Banner quảng cáo (khuyến mãi, chiến dịch tuyển dụng, quảng bá tính năng)
--   BRANDING      = Banner nhận diện thương hiệu ITing (slogan, giới thiệu nền tảng, giá trị cốt lõi)
ALTER TABLE banners
    ADD COLUMN IF NOT EXISTS banner_type VARCHAR(50) NOT NULL DEFAULT 'ADVERTISEMENT';
