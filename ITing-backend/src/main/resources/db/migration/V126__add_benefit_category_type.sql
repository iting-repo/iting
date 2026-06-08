-- V126: Thêm loại danh mục "BENEFIT" (Quyền lợi gói HR) + seed các quyền lợi cụ thể, định lượng được.
-- Admin chọn các quyền lợi này từ dropdown khi cấu hình gói (subscription_tier_pricing.benefits)
-- thay vì gõ tự do. Mỗi quyền lợi là 1 tính năng rõ ràng (không trừu tượng).
-- Idempotent: chỉ chèn khi chưa tồn tại (theo type + name).

INSERT INTO categories (type, name, name_en, description, active, sort_order)
SELECT 'BENEFIT', v.name, v.name_en, v.description, true, v.sort_order
FROM (
  VALUES
    ('Đăng tin tuyển dụng',            'Job posting',               'Số tin tuyển dụng được đăng mỗi tháng',                 0),
    ('Boost tin lên đầu trang',        'Boost to top',              'Đẩy tin nổi bật lên đầu trang việc làm',               1),
    ('Tin tuyển dụng nổi bật',         'Featured job',              'Tin được gắn nhãn nổi bật, ưu tiên hiển thị',          2),
    ('Credits AI tặng kèm',            'Bonus AI credits',          'Số credits dùng cho tính năng AI (gợi ý, chấm CV...)', 3),
    ('Gợi ý ứng viên bằng AI',         'AI candidate matching',     'Hệ thống AI gợi ý ứng viên phù hợp cho tin tuyển dụng', 4),
    ('Tìm kiếm ứng viên (Talent Pool)','Talent pool search',        'Chủ động tìm và lọc ứng viên trong kho hồ sơ',         5),
    ('Xem thông tin liên hệ ứng viên', 'View candidate contact',    'Xem email / số điện thoại của ứng viên',               6),
    ('Tải CV ứng viên',                'Download candidate CV',     'Tải về file CV của ứng viên',                          7),
    ('Xuất danh sách ứng viên (CSV)',  'Export candidates (CSV)',   'Xuất danh sách ứng viên ra file CSV',                  8),
    ('Lưu bộ lọc tìm kiếm',            'Saved search filters',      'Lưu lại các bộ lọc tìm kiếm ứng viên',                 9),
    ('Huy hiệu nhà tuyển dụng uy tín', 'Verified recruiter badge',  'Gắn huy hiệu xác thực cho nhà tuyển dụng',             10),
    ('Trang thương hiệu công ty',      'Company branding page',     'Trang giới thiệu công ty nổi bật, tùy biến',           11),
    ('Quản lý nhiều tài khoản HR',     'Multiple HR seats',         'Cho phép nhiều nhân sự cùng quản lý tuyển dụng',       12),
    ('Báo cáo & phân tích tuyển dụng', 'Recruitment analytics',     'Thống kê lượt xem, ứng tuyển, hiệu quả tin đăng',      13),
    ('Hỗ trợ ưu tiên qua email',       'Priority email support',    'Được ưu tiên xử lý yêu cầu hỗ trợ qua email',          14),
    ('Chuyên viên hỗ trợ riêng (CSM)', 'Dedicated CSM',             'Có chuyên viên chăm sóc khách hàng riêng',             15),
    ('Cam kết chất lượng dịch vụ (SLA)','Service SLA',              'Cam kết thời gian uptime / phản hồi dịch vụ',          16)
) AS v(name, name_en, description, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.type = 'BENEFIT' AND c.name = v.name
);
