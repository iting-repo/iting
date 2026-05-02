# Company Service Module

Mô-đun quản lý thông tin doanh nghiệp (Nhà tuyển dụng) và quy trình xác thực pháp lý.

## Chức năng chính
- **Hồ sơ doanh nghiệp**: Quản lý thông tin cơ bản, logo, địa chỉ, mô tả và lĩnh vực hoạt động.
- **Quy trình KYB (Know Your Business)**: 
    - Tải lên Giấy phép kinh doanh (Business License).
    - Tải lên Văn bản thỏa thuận dữ liệu cá nhân.
    - Theo dõi trạng thái duyệt hồ sơ (DRAFT, PENDING_REVIEW, APPROVED, REJECTED).
- **Event-Driven Integration**: Phát tín hiệu sự kiện khi doanh nghiệp hoàn tất hồ sơ để kích hoạt luồng thông báo/xét duyệt tự động.
- **Quản lý Follower**: Lấy số lượng và danh sách ứng viên theo dõi công ty.

## Công nghệ sử dụng
- **Kafka Producer**: Gửi message đến topic `kyb-notifications` để xử lý hậu kỳ (async).
- **S3 Service**: Lưu trữ tài liệu pháp lý và logo doanh nghiệp bảo mật.
- **Spring ApplicationEventPublisher**: Sử dụng Observer pattern nội bộ trước khi đẩy dữ liệu ra Kafka.

## API Endpoints tiêu biểu
- `GET /api/companies/me`: Lấy thông tin công ty hiện tại.
- `PUT /api/companies/me/basic-info`: Cập nhật thông tin cơ bản.
- `POST /api/companies/me/submit-info-review`: Gửi duyệt thông tin.
- `PUT /api/companies/me/business-license`: Tải lên giấy phép kinh doanh.
