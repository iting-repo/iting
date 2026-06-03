-- ============================================================================
-- V107__seed_quality_faqs.sql
-- ----------------------------------------------------------------------------
-- Seed 10 FAQ chất lượng cho trang /about. Xoá 2 FAQ placeholder
-- ("làm sao ITING phát triển" / "làm sao để đăng nhập?") đã được tạo
-- thủ công lúc test admin/faq. Migration idempotent: dùng slug làm khoá,
-- ON CONFLICT DO UPDATE để cập nhật content khi chạy lại.
-- ============================================================================

-- Xoá 2 FAQ test placeholder (slug đã thấy trên UI admin)
DELETE FROM static_contents
WHERE type = 'FAQ'
  AND slug IN ('faq-lam-sao-iting-phat-trien', 'faq-lam-sao-de-dang-nhap');

-- Seed 10 FAQ chất lượng (sort_order quyết định thứ tự hiển thị)
INSERT INTO static_contents
    (slug, type, title, content, published, sort_order, view_count, created_at, updated_at, published_at)
VALUES
    (
        'faq-upload-cv',
        'FAQ',
        'Tôi có thể tải lên CV của mình không?',
        '<p>Có. Bạn vào mục <strong>Hồ sơ cá nhân → CV của tôi</strong> và tải file PDF/DOCX lên. ITing sẽ tự động phân tích nội dung CV (kinh nghiệm, kỹ năng, học vấn) để gợi ý công việc phù hợp và giúp nhà tuyển dụng tìm thấy bạn nhanh hơn.</p>',
        TRUE, 1, 0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'faq-ai-matching',
        'FAQ',
        'AI matching hoạt động như thế nào?',
        '<p>ITing dùng <strong>embedding vector</strong> để so sánh nội dung CV của bạn với mô tả từng công việc đang tuyển. Kết quả trả về là điểm phù hợp (0–100%) kèm các lý do cụ thể: kỹ năng trùng khớp, kinh nghiệm tương đương, địa điểm phù hợp… Bạn càng cập nhật CV chi tiết, gợi ý càng chính xác.</p>',
        TRUE, 2, 0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'faq-recruitment-duration',
        'FAQ',
        'Quy trình tuyển dụng thường kéo dài bao lâu?',
        '<p>Tuỳ công ty và vị trí, trung bình <strong>1–3 tuần</strong> từ lúc nộp đơn đến khi nhận offer. Các bước phổ biến: sàng lọc CV (2–3 ngày), phỏng vấn sơ bộ (1 tuần), phỏng vấn chuyên môn (1 tuần), thương lượng lương và ký offer. Bạn có thể theo dõi trạng thái đơn ứng tuyển trong <strong>Ứng tuyển của tôi</strong>.</p>',
        TRUE, 3, 0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'faq-selection-steps',
        'FAQ',
        'Quy trình tuyển chọn ứng viên gồm những bước nào?',
        '<ol><li><strong>Sàng lọc CV</strong> – HR đọc và đánh dấu phù hợp/không phù hợp.</li><li><strong>Phỏng vấn sơ bộ</strong> – qua điện thoại hoặc video call.</li><li><strong>Phỏng vấn chuyên môn</strong> – có thể kèm bài test kỹ thuật.</li><li><strong>Phỏng vấn cuối</strong> – với quản lý trực tiếp hoặc lãnh đạo.</li><li><strong>Offer &amp; onboarding</strong> – thương lượng lương, ký hợp đồng, bắt đầu làm việc.</li></ol>',
        TRUE, 4, 0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'faq-intern-fresher',
        'FAQ',
        'Nền tảng có tuyển sinh viên mới ra trường và thực tập sinh không?',
        '<p>Có. ITing dành riêng bộ lọc <strong>Cấp bậc kinh nghiệm: Intern / Fresher</strong> ở trang Công việc. Nhiều công ty công nghệ lớn đăng tuyển chương trình thực tập 3–6 tháng kèm cơ hội chuyển full-time, lương khởi điểm thường từ 5–12 triệu/tháng.</p>',
        TRUE, 5, 0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'faq-job-alert',
        'FAQ',
        'Tôi có nhận được thông báo khi có việc làm mới phù hợp không?',
        '<p>Có. Bạn vào <strong>Cài đặt → Thông báo</strong> và bật <em>Saved Search Alert</em>. ITing sẽ gửi email + push notification mỗi khi có job mới khớp với kỹ năng / địa điểm / mức lương bạn đã lưu. Tần suất có thể chọn ngay khi đăng ký: real-time, daily digest hoặc weekly digest.</p>',
        TRUE, 6, 0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'faq-data-privacy',
        'FAQ',
        'Dữ liệu cá nhân của tôi có an toàn không?',
        '<p>ITing tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. CV và thông tin liên hệ <strong>chỉ hiển thị cho nhà tuyển dụng đã được xác thực doanh nghiệp</strong>. Bạn có quyền ẩn hồ sơ bất cứ lúc nào (bật chế độ <em>Đang tìm việc: Tắt</em>), xoá tài khoản hoặc yêu cầu xuất toàn bộ dữ liệu cá nhân trong trang <strong>Cài đặt bảo mật</strong>.</p>',
        TRUE, 7, 0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'faq-employer-post-job',
        'FAQ',
        'Nhà tuyển dụng đăng tin tuyển dụng như thế nào?',
        '<p>Đăng ký tài khoản <strong>Nhà tuyển dụng</strong> tại nút "Đăng ký" góc phải, hoàn tất xác thực doanh nghiệp (giấy phép kinh doanh + giấy uỷ quyền) và bạn có thể đăng tin ngay. Mỗi tin tuyển dụng sẽ được AI kiểm duyệt nội dung trong vòng vài phút, sau đó hiển thị công khai và bắt đầu nhận hồ sơ.</p>',
        TRUE, 8, 0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'faq-credits',
        'FAQ',
        'Hệ thống credits của nhà tuyển dụng dùng để làm gì?',
        '<p>Credits là đơn vị thanh toán nội bộ của ITing, dùng cho các tính năng nâng cao: <strong>AI tìm ứng viên</strong> (5 credits/lần tìm theo job), <strong>boost job</strong> lên top kết quả tìm kiếm, gửi tin nhắn trực tiếp tới ứng viên đã ẩn email. Bạn có thể mua credit theo gói tại trang <strong>Gói dịch vụ</strong>, hoặc nhận miễn phí khi mới đăng ký doanh nghiệp.</p>',
        TRUE, 9, 0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'faq-contact-support',
        'FAQ',
        'Tôi cần hỗ trợ — liên hệ ITing bằng cách nào?',
        '<p>Bạn có thể liên hệ chúng tôi qua các kênh sau:</p><ul><li>📧 Email: <strong>support@iting.vn</strong> (phản hồi trong 24h làm việc)</li><li>💬 Live chat: nút chat ở góc phải mỗi trang (giờ hành chính)</li><li>📞 Hotline: <strong>1900 0000</strong> (8h–17h thứ 2 đến thứ 6)</li><li>📝 Form: trang <a href="/contact">Liên hệ</a></li></ul>',
        TRUE, 10, 0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    published = EXCLUDED.published,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;
