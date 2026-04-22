# Infrastructure & Common Services

Tài liệu về các dịch vụ hạ tầng và tiện ích dùng chung cho toàn dự án ITing.

## 1. Lưu trữ Tệp tin (File Service)
Dự án hỗ trợ đa nền tảng lưu trữ thông qua cấu hình:
- **AWS S3 / DigitalOcean Spaces**: Lưu trữ CV, Giấy phép kinh doanh (Bảo mật qua Presigned URL).
- **Cloudinary**: Tối ưu hóa việc lưu trữ và xử lý hình ảnh (Logo, Banner).
- **Local Storage**: Sử dụng cho môi trường phát triển (Development).

## 2. Nhắn tin & Đồng bộ (Messaging)
- **Apache Kafka**: 
    - Giải quyết bài toán Peak Traffic (1000+ request cùng lúc).
    - Phân tách luồng xử lý đồng bộ và bất đồng bộ (Worker pattern).
- **Zookeeper**: Điều phối cụm Kafka.
- **Spring Application Events**: Đồng bộ hóa dữ liệu nội bộ trong cùng một service.

## 3. Bảo vệ hệ thống (Security & Protection)
- **Bucket4j (Rate Limiting)**: Đánh chặn spam API. Mặc định giới hạn 1 request/5 phút cho các thao tác nhạy cảm (Submit KYB).
- **Redis (Tùy chọn)**: Lưu trữ Cache và Session, hỗ trợ Rate Limit khi scale-out.

## 4. Tiện ích chung (Common Utilities)
- **Excel Helper (Apache POI)**: Đọc/Ghi file Excel cho báo cáo và quản lý dữ liệu lớn.
- **Docker Compose**: Hỗ trợ triển khai nhanh môi trường Database, Kafka, Redis cục bộ.
- **Global Exception Handling**: Chuẩn hóa định dạng lỗi trả về cho Frontend.

## Quy trình triển khai nhanh (Local Setup)
1. Chạy `docker-compose up -d` để khởi động Kafka/DB.
2. Cấu hình file `.env` các tham số bí mật (S3 Key, Mail Config).
3. Chạy ứng dụng Spring Boot.
