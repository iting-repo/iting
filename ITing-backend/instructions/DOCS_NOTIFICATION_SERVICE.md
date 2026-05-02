# Notification Service Module

Mô-đun chịu trách nhiệm gửi thông báo đến người dùng qua các kênh In-app và Email.

## Chức năng chính
- **Thông báo In-app**: Hiển thị thông báo trên giao diện web (Real-time).
- **Thông báo qua Email**: Gửi xác thực tài khoản, nhắc nhở phỏng vấn, thông báo duyệt hồ sơ.
- **Async Processing**: Xử lý việc tạo thông báo thông qua hàng đợi Kafka để không làm chậm luồng API chính.

## Công nghệ sử dụng
- **Kafka Consumer (Worker)**: Lắng nghe các topic (`kyb-notifications`, `job-events`) để tạo thông báo tương ứng.
- **Spring Mail**: Gửi email thông qua SMTP server.
- **WebSocket (Tùy chọn)**: Đẩy thông báo tức thời cho người dùng đang online.

## Quy trình xử lý Kafka
1. **Producer** (ví dụ từ Company Service) gửi payload đến Kafka.
2. **Notification Worker** (Consumer) nhận message.
3. **Notification Service** lưu thông báo vào database và gửi Email (nếu cần).

## API Endpoints tiêu biểu
- `GET /api/notifications`: Lấy danh sách thông báo của tôi.
- `PATCH /api/notifications/{id}/read`: Đánh dấu đã đọc.
- `GET /api/notifications/unread/count`: Số lượng thông báo chưa xem.
