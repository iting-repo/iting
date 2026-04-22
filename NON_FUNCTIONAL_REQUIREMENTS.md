# Non-Functional Requirements (NFR) - ITing Platform

Tài liệu này thống nhất các yêu cầu phi chức năng cho hệ thống ITing dựa trên hiện trạng phát triển và mục tiêu vận hành thực tế.

## 1. Hiệu năng (Performance)
Hệ thống phải đảm bảo trải nghiệm mượt mà ngay cả khi lượng dữ liệu lớn.

- **Thời gian phản hồi API (Response Time)**:
  - Các truy vấn tìm kiếm cơ bản (Keyword Search): **< 1.0 giây**.
  - Các truy vấn tìm kiếm thông minh/AI (Vector Search): **< 2.5 giây**.
  - Tải trang chủ và gợi ý (Recommendation): **< 3.0 giây**.
  - Các thao tác cập nhật (POST/PUT): **< 1.5 giây**.
- **Khả năng chịu tải (Concurrent Users)**:
  - Hỗ trợ ít nhất **500 người dùng đồng thời** mà không làm tăng thời gian phản hồi quá 50%.
- **Tối ưu hóa Database**:
  - Đảm bảo các cột hay truy vấn (`Job.Status`, `Job.Last_update`, `Apply_form.Job_id`) đều có Index.
  - Sử dụng Lazy Loading cho các quan hệ Hibernate để tránh Over-fetching.

## 2. Bảo mật (Security)
Bảo mật thông tin ứng viên và tính hợp pháp của tin tuyển dụng là ưu tiên hàng đầu.

- **Xác thực & Ủy quyền (Auth & RBAC)**:
  - Sử dụng **JWT (JSON Web Token)** với cơ chế Rotation (Refresh Token) để hạn chế rủi ro lộ token.
  - Phân quyền nghiêm ngặt dựa trên Role (CANDIDATE, EMPLOYER, ADMIN). 
  - Đảm bảo HR chỉ có quyền thao tác trên các bản ghi thuộc về `Company` của họ (đã implement `verifyJobOwnership`).
- **Bảo vệ dữ liệu**:
  - Mã hóa mật khẩu bằng **BCrypt** (Strength: 10).
  - Sử dụng **HTTPS** cho toàn bộ các kết nối từ Client.
  - Sanitization: Mọi đầu vào từ người dùng phải được validate qua `Jakarta Validation` định nghĩa trong DTO.
- **Quyền riêng tư**:
  - Ứng viên có quyền cài đặt ẩn hồ sơ hoặc chỉ cho phép các HR nhất định xem.

## 3. Độ tin cậy & Tính sẵn sàng (Availability & Reliability)
- **Uptime**: Duy trì tính sẵn sàng tối thiểu **99.9%**.
- **Xử lý lỗi (Error Handling)**:
  - Trả về mã lỗi chuẩn RESTful (4xx, 5xx) kèm thông điệp rõ ràng (`ApiResponse` format).
  - Hệ thống log (Sentry/ELK) phải ghi lại các lỗi 500 kèm Stacktrace để xử lý kịp thời.
- **Tính toàn vẹn (Data Integrity)**:
  - Sử dụng `@Transactional` cho các thao tác ghi dữ liệu phức tạp (ví dụ: Nộp đơn tuyển dụng, Duyệt tin).
  - Ràng buộc khóa ngoại vật lý trong DB để tránh dữ liệu mồ côi.

## 4. Khả năng mở rộng (Scalability)
- **Kiến trúc**: Backend thiết kế theo dạng Module hóa, sẵn sàng tách nhỏ thành Microservices nếu cần.
- **Lưu trữ**: Sử dụng các dịch vụ Cloud Object Storage (S3) để quản lý CV và ảnh logo, giảm tải cho Application Server.

## 5. Tính khả dụng (Usability)
- **Responsive Design**: Giao diện React hoạt động tốt trên tất cả các trình duyệt hiện đại (Chrome, Safari, Edge) và mọi kích thước màn hình (Desktop, Tablet, Mobile).
- **Internationalization (i18n)**: Hỗ trợ linh hoạt Tiếng Việt (chính) và Tiếng Anh.

---

*Cập nhật lần cuối: 21/04/2026*
