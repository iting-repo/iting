# Job Service Module

Mô-đun cốt lõi xử lý các nghiệp vụ liên quan đến tin tuyển dụng và ứng tuyển.

## Chức năng chính
- **Quản lý Tin tuyển dụng**: Nhà tuyển dụng tạo, chỉnh sửa và đóng tin tuyển dụng.
- **Tìm kiếm việc làm**: Ứng viên tìm kiếm theo từ khóa, địa điểm, mức lương, và kỹ năng.
- **Quản lý ứng tuyển (Application)**: 
    - Ứng viên nộp CV cho tin tuyển dụng.
    - Nhà tuyển dụng duyệt danh sách hồ sơ ứng tuyển, thay đổi trạng thái (VIEWED, INTERVIEWING, ACCEPTED, REJECTED).
- **Gợi ý việc làm**: Dựa trên hồ sơ ứng viên để đề xuất tin tuyển dụng phù hợp.

## Công nghệ sử dụng
- **Elasticsearch (Tùy chọn)**: Hỗ trợ tìm kiếm Full-text search tốc độ cao.
- **Spring Data JPA**: Quản lý quan hệ giữa Job, Application và User.
- **Presigned URLs**: Cung cấp link xem CV ứng viên trực tiếp từ S3.

## API Endpoints tiêu biểu
- `GET /api/jobs`: Danh sách tin tuyển dụng (Public).
- `POST /api/employer/jobs`: Tạo tin tuyển dụng mới.
- `POST /api/jobs/{id}/apply`: Nộp đơn ứng tuyển.
- `GET /api/employer/jobs/{id}/applications`: Xem danh sách ứng viên đã nộp.
