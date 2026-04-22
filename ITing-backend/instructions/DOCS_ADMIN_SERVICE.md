# Admin Service Module

Mô-đun Quản trị (Admin) chịu trách nhiệm quản lý toàn bộ hệ thống ITing, giám sát hoạt động của người dùng và doanh nghiệp.

## Chức năng chính
- **Quản lý Doanh nghiệp (KYB)**: 
    - Duyệt/Từ chối thông tin cơ bản và giấy phép kinh doanh.
    - Quản lý hàng đợi xét duyệt (Work Queue) cho đội ngũ CS.
    - Lưu trữ ghi chú nội bộ (Internal Notes) cho từng doanh nghiệp.
- **Quản lý Người dùng**: Giám sát trạng thái hoạt động, vai trò và lịch sử đăng nhập.
- **Quản lý Báo cáo (Report)**: Xử lý các báo cáo vi phạm từ người dùng đối với tin tuyển dụng hoặc doanh nghiệp.
- **Audit Log**: Ghi lại mọi hành động nhạy cảm của Admin (Duyệt, Xóa, Đình chỉ) để kiểm soát dữ liệu.
- **Cấu hình hệ thống**: Quản lý các tham số cấu hình toàn cục.

## Công nghệ sử dụng
- **Spring Data JPA**: Truy vấn dữ liệu phức tạp với Pagination và Filter.
- **Apache POI**: Xuất bản và nhập danh sách doanh nghiệp qua file Excel.
- **Audit Logging**: Hệ thống lưu vết lịch sử thao tác.

## API Endpoints tiêu biểu
- `GET /api/admin/companies/pending-reviews`: Lấy danh sách chờ duyệt.
- `POST /api/admin/companies/{id}/approve-info`: Duyệt thông tin công ty.
- `POST /api/admin/companies/{id}/notes`: Thêm ghi chú CS.
- `GET /api/admin/reports`: Danh sách báo cáo vi phạm.
