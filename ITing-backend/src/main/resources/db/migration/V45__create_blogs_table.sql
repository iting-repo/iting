-- Blog / Article management table
CREATE TABLE IF NOT EXISTS blogs (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(500) NOT NULL UNIQUE,
    category        VARCHAR(100),
    status          VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    summary         TEXT,
    content         TEXT,
    thumbnail_url   VARCHAR(1000),
    author          VARCHAR(255),
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    seo_meta_title       VARCHAR(500),
    seo_meta_description TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed some sample blog data
INSERT INTO blogs (title, slug, category, status, summary, content, thumbnail_url, author, is_featured, seo_meta_title, seo_meta_description, display_order)
VALUES
('10 Mẹo viết CV chuyên nghiệp', '10-meo-viet-cv-chuyen-nghiep', 'Hướng dẫn', 'PUBLISHED',
 'Hướng dẫn chi tiết cách viết CV ấn tượng, giúp bạn nổi bật trước hàng trăm ứng viên khác.',
 '<h2>Tại sao CV quan trọng?</h2><p>CV là ấn tượng đầu tiên của bạn với nhà tuyển dụng. Một CV chuyên nghiệp có thể giúp bạn vượt qua vòng hồ sơ dễ dàng hơn.</p><h2>1. Chọn layout phù hợp</h2><p>Sử dụng font chữ đơn giản, dễ đọc và bố cục rõ ràng.</p><h2>2. Tóm tắt bản thân</h2><p>Phần tóm tắt nên ngắn gọn, tập trung vào điểm mạnh và mục tiêu nghề nghiệp.</p>',
 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80', 'Admin', TRUE,
 '10 Mẹo viết CV chuyên nghiệp | ITing Blog', 'Học cách viết CV chuyên nghiệp giúp bạn ghi điểm với nhà tuyển dụng.', 0),

('Xu hướng tuyển dụng IT 2024', 'xu-huong-tuyen-dung-it-2024', 'Tin tức', 'PUBLISHED',
 'Phân tích thị trường IT và cơ hội việc làm nổi bật trong năm 2024.',
 '<h2>Thị trường IT đang biến đổi</h2><p>Năm 2024 chứng kiến sự bùng nổ của AI, Cloud Computing và Cybersecurity. Nhu cầu tuyển dụng tăng mạnh ở các vị trí liên quan.</p><h2>Top ngôn ngữ lập trình hot</h2><p>Python, TypeScript, Rust tiếp tục dẫn đầu. Golang cũng đang có xu hướng tăng.</p>',
 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80', 'Admin', FALSE,
 'Xu hướng tuyển dụng IT 2024 | ITing Blog', 'Cập nhật xu hướng tuyển dụng lập trình viên năm 2024.', 1),

('Kỹ năng phỏng vấn online hiệu quả', 'ky-nang-phong-van-online-hieu-qua', 'Kỹ năng', 'DRAFT',
 'Những mẹo quan trọng giúp bạn tỏa sáng trong buổi phỏng vấn trực tuyến.',
 '<h2>Chuẩn bị kỹ thuật</h2><p>Kiểm tra camera, microphone, và kết nối internet trước buổi phỏng vấn ít nhất 15 phút.</p><h2>Trang phục và nền</h2><p>Mặc trang phục chuyên nghiệp, chọn nền đơn giản, sạch sẽ.</p>',
 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80', 'Editor', FALSE,
 '', '', 2);
