-- Seed sample data for user_reports
INSERT INTO user_reports (reporter_id, target_id, target_type, target_name, type, reason, description, status, priority, created_at)
VALUES
-- Báo cáo về Tin tuyển dụng
(101, 1, 'JOB', 'Senior Backend Developer (Python)', 'SCAM', 'Yêu cầu đóng phí cọc', 'Nhà tuyển dụng yêu cầu chuyển khoản 500k tiền cọc đồng phục trước khi phỏng vấn.', 'PENDING', 'CRITICAL', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(102, 2, 'JOB', 'Backend Engineer (Node.js)', 'OTHER', 'Thông tin lương không khớp', 'Mô tả ghi 35tr nhưng khi phỏng vấn báo chỉ có 20tr.', 'REVIEWING', 'MEDIUM', CURRENT_TIMESTAMP - INTERVAL '3 days'),

-- Báo cáo về Công ty
(104, 15, 'COMPANY', 'Shopee Vietnam', 'FAKE_INFO', 'Sử dụng logo trái phép', 'Phát hiện tài khoản này giả mạo Shopee để lừa đảo ứng viên.', 'PENDING', 'HIGH', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(105, 13, 'COMPANY', 'VinGroup', 'OTHER', 'Môi trường làm việc không đúng mô tả', 'Trải nghiệm phỏng vấn rất tệ, HR không tôn trọng ứng viên.', 'RESOLVED', 'LOW', CURRENT_TIMESTAMP - INTERVAL '10 days'),

-- Báo cáo về Người dùng
(101, 103, 'USER', 'Le Van C', 'HARASSMENT', 'Gửi tin nhắn quấy rối', 'Người dùng này liên tục nhắn tin làm phiền với mục đích cá nhân.', 'PENDING', 'HIGH', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(102, 104, 'USER', 'Pham Thi D', 'SPAM', 'Spam link quảng cáo', 'Gửi link rác vào phần bình luận tin tuyển dụng.', 'DISMISSED', 'LOW', CURRENT_TIMESTAMP - INTERVAL '4 days'),

-- Báo cáo về Review (Giả định ID)
(103, 1, 'REVIEW', 'Đánh giá về FPT Software', 'INAPPROPRIATE', 'Chứa ngôn từ thô tục', 'Bình luận chứa nhiều từ ngữ xúc phạm đồng nghiệp.', 'PENDING', 'MEDIUM', CURRENT_TIMESTAMP - INTERVAL '12 hours'),

-- Thêm một số báo cáo cũ đã xử lý để có dữ liệu thống kê
(101, 3, 'JOB', 'Frontend Developer (React)', 'COPYRIGHT', 'Sao chép mô tả từ công ty khác', 'Mô tả công việc giống 100% với tin của bên VNG.', 'RESOLVED', 'MEDIUM', CURRENT_TIMESTAMP - INTERVAL '15 days'),
(102, 12, 'COMPANY', 'VNG Corporation', 'OTHER', 'Lỗi hiển thị bản đồ', 'Địa chỉ trên bản đồ bị sai lệch.', 'RESOLVED', 'LOW', CURRENT_TIMESTAMP - INTERVAL '20 days');
