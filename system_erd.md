# Hệ Thống Thực Thể ITing (ERD)

Tài liệu này cung cấp cái nhìn tổng quan về cấu trúc cơ sở dữ liệu và các thực thể (biến) trong toàn bộ hệ thống ITing.

## Biểu Đồ ERD (Mermaid)

```mermaid
erDiagram
    ACCOUNT ||--o| USERS : "là"
    ACCOUNT ||--o| COMPANY : "là"
    ACCOUNT ||--o| ADMIN_ACCOUNTS : "là"
    ACCOUNT ||--o{ BAN_HISTORY : "bị ghi nhận"
    ACCOUNT ||--o{ REFRESH_TOKENS : "sở hữu"

    USERS ||--o| CANDIDATE_PROFILES : "có profile"
    USERS ||--o{ ACTIVITY_LOGS : "thực hiện"
    USERS ||--o{ USER_REPORTS : "báo cáo/bị báo cáo"
    USERS ||--o{ USER_SAVE_JOB : "lưu"
    USERS ||--o{ USER_FOLLOW_COMPANY : "theo dõi"
    USERS ||--o{ USER_CONTACT_COMPANY : "liên hệ"
    USERS ||--o{ APPLY_FORM : "nộp"

    VN_LOCATION ||--o{ USERS : "vị trí"
    VN_LOCATION ||--o{ JOB : "địa điểm"

    COMPANY ||--o{ JOB : "đăng"
    COMPANY ||--o{ USER_FOLLOW_COMPANY : "được theo dõi"
    COMPANY ||--o{ USER_CONTACT_COMPANY : "được liên hệ"
    COMPANY ||--o{ COMPANY_AUDIT_LOG : "lịch sử thay đổi"
    COMPANY ||--o{ COMPANY_INDUSTRIES : "thuộc lĩnh vực"

    CANDIDATE_PROFILES ||--o{ EDUCATION : "học vấn"
    CANDIDATE_PROFILES ||--o{ EXPERIENCE : "kinh nghiệm"
    CANDIDATE_PROFILES ||--o{ SKILL : "kỹ năng"
    CANDIDATE_PROFILES ||--o{ CERTIFICATE : "chứng chỉ"
    CANDIDATE_PROFILES ||--o{ CV : "hồ sơ"
    CANDIDATE_PROFILES ||--o{ SOCIAL_LINK : "mạng xã hội"
    CANDIDATE_PROFILES ||--o{ PORTFOLIO : "dự án"
    CANDIDATE_PROFILES ||--o| CONTACT_INFO : "thông tin liên hệ"

    JOB ||--o{ APPLY_FORM_USER_TO_JOB : "được ứng tuyển"
    JOB ||--o{ COMPANY_UPLOAD_JOB : "quản lý bởi"
    JOB ||--o{ USER_SAVE_JOB : "được lưu"

    APPLY_FORM ||--o{ APPLY_FORM_USER_TO_JOB : "trong đợt ứng tuyển"
    CV ||--o{ APPLY_FORM : "được đính kèm"

    CONVERSATIONS ||--o{ MESSAGES : "chứa"
    ACCOUNT ||--o{ MESSAGES : "gửi"

    ACCOUNT {
        bigint id PK
        string email
        string password
        string role
        string status
        timestamp last_login
        int login_count
    }

    USERS {
        bigint id PK, FK
        string full_name
        string phone_num
        string avatar
        text cv_embedding
        bigint loc_id FK
    }

    COMPANY {
        bigint company_id PK, FK
        string name
        string email
        string tax_code
        string industry
        string company_size
        string verification_level
        boolean active
    }

    JOB {
        bigint id PK
        bigint company_id FK
        string title
        string position
        decimal min_salary
        decimal max_salary
        text description
        string status
        timestamp created_at
    }

    CANDIDATE_PROFILES {
        bigint id PK, FK
        string headline
        text short_bio
        int total_experience_years
        boolean is_open_to_work
    }

    CV {
        bigint id PK
        bigint profile_id FK
        string title
        string file_path
        boolean is_default
    }

    APPLY_FORM {
        bigint id PK
        bigint user_id FK
        bigint cv_id FK
        string applicant_name
        text introduction
    }

    MESSAGES {
        bigint id PK
        bigint conversation_id FK
        bigint sender_id FK
        text content
        timestamp sent_at
    }
```

## Danh Sách Các Thực Thể Chính

### 1. Quản Lý Tài Khoản (Authentication)
- **Account**: Thông tin đăng nhập, vai trò (CANDIDATE, EMPLOYER, ADMIN).
- **Refresh_tokens**: Quản lý phiên đăng nhập.
- **Ban_history**: Lịch sử khóa/mở tài khoản.

### 2. Người Dùng & Ứng Viên (Candidate)
- **Users**: Thông tin cơ bản người dùng.
- **Candidate_profiles**: Thông tin chuyên sâu (headline, bio).
- **CV**: Các tệp hồ sơ đã tải lên.
- **Education/Experience/Skill**: Các thành phần của hồ sơ năng lực.

### 3. Công Ty & Nhà Tuyển Dụng (Employer)
- **Company**: Thông tin doanh nghiệp, trạng thái xác thực.
- **Company_industries**: Liên kết công ty với các ngành nghề.
- **Company_audit_log**: Nhật ký kiểm duyệt thông tin công ty.

### 4. Việc Làm & Ứng Tuyển (Jobs & Applications)
- **Job**: Thông tin chi tiết công việc, mức lương, yêu cầu.
- **Apply_form**: Đơn ứng tuyển (gom nhóm thông tin người dùng và CV).
- **Apply_form_user_to_job**: Bảng liên kết ứng tuyển giữa người dùng và công việc.

### 5. Tương Tác & Hệ Thống
- **Conversations/Messages**: Hệ thống chat giữa ứng viên và công ty.
- **Notification**: Thông báo hệ thống.
- **Activity_logs**: Nhật ký hoạt động của người dùng.
- **System_configs**: Các cấu hình động của hệ thống (email, giới hạn, ...).
- **VN_location**: Danh mục địa điểm (Tỉnh/Thành phố).

---
*Ghi chú: ERD này được tổng hợp từ các file migration hiện có trong hệ thống backend.*
