-- ============================================================================
-- V108__seed_example_banners.sql
-- ----------------------------------------------------------------------------
-- Seed 3 banner ví dụ dùng các ảnh AVIF có sẵn trong frontend public/:
--   /jobportal_banner.avif, /jobportal_banner2.avif, /jobportal_banner3.avif
-- (FE serve static files ở root → URL relative hoạt động cả local và prod).
--
-- Phân bố:
--   • homepage_main: 2 banner xoay vòng (priority cao + thấp)
--   • job_detail   : 1 banner phụ (priority thấp hơn banner "khuyến mãi" hiện có)
--
-- Idempotent: chỉ insert khi chưa tồn tại banner cùng title (banners không
-- có unique constraint trên title nhưng tránh tạo trùng khi seed lại tay).
-- ============================================================================

INSERT INTO banners (position, title, image_desktop, image_mobile, link, priority, status, created_at, updated_at)
SELECT * FROM (VALUES
    (
        'homepage_main',
        'Tuyển dụng IT hàng đầu — Tìm việc cùng ITing',
        '/jobportal_banner.avif',
        '/jobportal_banner.avif',
        '/jobs',
        100,
        'ACTIVE',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'homepage_main',
        'Khám phá hàng ngàn cơ hội Fresher & Intern',
        '/jobportal_banner2.avif',
        '/jobportal_banner2.avif',
        '/jobs?experienceLevel=INTERN',
        90,
        'ACTIVE',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'job_detail',
        'Tăng tỷ lệ trúng tuyển với AI matching',
        '/jobportal_banner3.avif',
        '/jobportal_banner3.avif',
        '/about',
        50,
        'ACTIVE',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
) AS new_banners(position, title, image_desktop, image_mobile, link, priority, status, created_at, updated_at)
WHERE NOT EXISTS (
    SELECT 1 FROM banners b WHERE b.title = new_banners.title
);
