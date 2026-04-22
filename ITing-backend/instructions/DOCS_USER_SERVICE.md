# User & Candidate Service Module

Mô-đun quản lý thông tin cá nhân của ứng viên và các hoạt động của người dùng cá nhân.

## Chức năng chính
- **Quản lý Hồ sơ Ứng viên**: Thông tin liên hệ, trình độ học vấn, kinh nghiệm làm việc và kỹ năng.
- **Quản lý CV**: Tải lên và quản lý nhiều bản CV (PDF).
- **Việc làm đã lưu**: Danh sách các tin tuyển dụng ứng viên quan tâm.
- **Lịch sử ứng tuyển**: Theo dõi trạng thái của các đơn ứng tuyển đã nộp.

## Công nghệ sử dụng
- **S3 Storage**: Lưu trữ file CV của ứng viên (bảo mật với mã hóa).
- **Spring Data JPA**: Quản lý thông tin hồ sơ chi tiết.

## API Endpoints tiêu biểu
- `GET /api/users/me/profile`: Lấy thông tin cá nhân.
- `POST /api/users/me/cv`: Tải lên bản CV mới.
- `GET /api/users/me/applications`: Danh sách đơn ứng tuyển của tôi.
- `POST /api/users/me/saved-jobs/{job_id}`: Lưu tin tuyển dụng.
