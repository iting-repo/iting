# Auth & Security Service Module

Mô-đun chịu trách nhiệm về xác thực, phân quyền và bảo mật toàn bộ hệ thống.

## Chức năng chính
- **Đăng ký & Đăng nhập**: Hỗ trợ nhiều vai trò người dùng (CANDIDATE, EMPLOYER, ADMIN).
- **JWT Authentication**: Cơ chế xác thực sử dụng JSON Web Token với Access Token và Refresh Token.
- **RBAC (Role-Based Access Control)**: Phân quyền truy cập tài nguyên dựa trên vai trò người dùng.
- **Quên mật khẩu**: Quy trình khôi phục mật khẩu qua Email OTP.
- **Social Login**: Tích hợp đăng nhập qua Google/Facebook (tùy chọn).

## Công nghệ sử dụng
- **Spring Security**: Cấu hình bảo mật và Filter chain.
- **JJWT (Java JWT)**: Tạo và xác thực các chuỗi token bảo mật.
- **Spring Mail**: Gửi mã xác thực/liên kết đổi mật khẩu.

## API Endpoints tiêu biểu
- `POST /api/auth/login`: Đăng nhập hệ thống.
- `POST /api/auth/register`: Đăng ký tài khoản mới.
- `POST /api/auth/refresh-token`: Gia hạn Access Token.
- `POST /api/auth/forgot-password`: Yêu cầu cấp lại mật khẩu.
