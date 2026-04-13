# CV Management & Job Application Features

## Tổng Quan

Tài liệu này mô tả 2 tính năng mới được phát triển cho hệ thống ITing Job Portal:

1. **API lấy danh sách công việc đã ứng tuyển**
2. **API quản lý CV với giới hạn 3 CV mới nhất**

---

## 1. API Lấy Danh Sách Công Việc Đã Ứng Tuyển

### Endpoint
```
GET /api/candidates/applications/my-applications
```

### Mô tả
Endpoint này cho phép ứng viên xem danh sách tất cả các công việc mà họ đã ứng tuyển.

### Request Parameters
- `page` (optional, default = 0): Số trang
- `size` (optional, default = 10): Số lượng kết quả mỗi trang

### Request Headers
- `Authorization: Bearer <JWT_TOKEN>`

### Response Example
```json
{
  "content": [
    {
      "id": 1,
      "userId": 123,
      "jobId": 456,
      "applicantName": "Nguyen Van A",
      "jobTitle": "Senior Java Developer",
      "introduction": "I am interested in this position...",
      "cvFileName": "NguyenVanA_CV",
      "cvFileType": "PDF",
      "cvUrl": "https://s3.amazonaws.com/...",
      "timeSent": "2026-03-28T10:30:00",
      "status": "PENDING"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 25,
  "totalPages": 3
}
```

---

## 2. API Quản Lý CV

### 2.1. Lấy 3 CV Mới Nhất

#### Endpoint
```
GET /api/candidates/cvs/recent
```

#### Mô tả
Endpoint này được gọi khi người dùng bấm nút "Apply" để hiển thị danh sách CV đã upload. Hệ thống chỉ hiển thị 3 CV mới nhất.

#### Request Headers
- `Authorization: Bearer <JWT_TOKEN>`

#### Response Example
```json
[
  {
    "id": 1,
    "title": "Senior Developer CV",
    "fileName": "NguyenVanA_CV_2026.pdf",
    "fileUrl": "https://datn-jobweb.s3.ap-southeast-1.amazonaws.com/...",
    "uploadedAt": "2026-03-28T10:30:00"
  },
  {
    "id": 2,
    "title": "Full Stack Developer CV",
    "fileName": "NguyenVanA_CV_Updated.pdf",
    "fileUrl": "https://datn-jobweb.s3.ap-southeast-1.amazonaws.com/...",
    "uploadedAt": "2026-03-25T15:20:00"
  },
  {
    "id": 3,
    "title": "Backend Developer CV",
    "fileName": "NguyenVanA_Backend.pdf",
    "fileUrl": "https://datn-jobweb.s3.ap-southeast-1.amazonaws.com/...",
    "uploadedAt": "2026-03-20T09:00:00"
  }
]
```

### 2.2. Upload CV Mới

#### Endpoint
```
POST /api/candidates/cvs/upload
```

#### Mô tả
Upload CV mới cho người dùng. Hệ thống tự động quản lý giới hạn 3 CV:
- Nếu số lượng CV < 3: Upload bình thường
- Nếu số lượng CV >= 3: Tự động xóa CV cũ nhất (cả từ database và AWS S3), sau đó upload CV mới

#### Request
- Content-Type: `multipart/form-data`
- Headers: `Authorization: Bearer <JWT_TOKEN>`

#### Form Data Parameters
- `file` (required): File CV (PDF, DOC, DOCX)
- `title` (optional): Tiêu đề CV

#### Response Example
```json
{
  "id": 4,
  "title": "Software Engineer CV",
  "fileName": "NguyenVanA_2026_Updated.pdf",
  "fileUrl": "https://datn-jobweb.s3.ap-southeast-1.amazonaws.com/...",
  "uploadedAt": "2026-03-28T14:30:00"
}
```

### 2.3. Kiểm Tra Số Lượng CV

#### Endpoint
```
GET /api/candidates/cvs/count
```

#### Mô tả
Kiểm tra số lượng CV hiện tại của người dùng.

#### Request Headers
- `Authorization: Bearer <JWT_TOKEN>`

#### Response Example
```json
{
  "count": 3,
  "maxAllowed": 3,
  "hasReachedLimit": true
}
```

---

## Luồng Hoạt Động (Workflow)

### Khi Người Dùng Bấm Nút "Apply"

```
1. Frontend gọi GET /api/candidates/cvs/recent
2. Backend trả về danh sách 3 CV mới nhất
3. Frontend hiển thị danh sách CV cho người dùng chọn
4. Người dùng chọn CV và điền thông tin
5. Frontend gọi POST /api/candidates/applications/apply
6. Đơn ứng tuyển được tạo thành công
```

### Khi Upload CV Mới

```
1. Người dùng chọn file CV
2. Frontend gọi POST /api/candidates/cvs/upload
3. Backend kiểm tra số lượng CV:
   - Nếu >= 3: Xóa CV cũ nhất từ S3 và database
4. Backend upload file mới lên S3
5. Backend lưu metadata vào database
6. Backend trả về thông tin CV mới
```

---

## Cấu Hình AWS S3

### Environment Variables (application.properties)

Bạn cần cấu hình các biến môi trường sau:

```properties
# AWS S3 Configuration
aws.s3.access-key=${AWS_ACCESS_KEY}
aws.s3.secret-key=${AWS_SECRET_KEY}
aws.s3.region=${AWS_REGION:ap-southeast-1}
aws.s3.bucket=${AWS_S3_BUCKET:datn-jobweb}
```

### Cách Setup

1. Tạo bucket trên AWS S3 (ví dụ: `datn-jobweb`)
2. Tạo IAM User với quyền S3 Full Access
3. Lấy Access Key và Secret Key
4. Set environment variables:
   ```bash
   export AWS_ACCESS_KEY=your_access_key
   export AWS_SECRET_KEY=your_secret_key
   export AWS_REGION=ap-southeast-1
   export AWS_S3_BUCKET=datn-jobweb
   ```

---

## Database Migration

### Chạy Migration Script

Để thêm các cột mới vào bảng CV, chạy file migration SQL:

```bash
psql -U postgres -d iting_job_portal -f src/main/resources/migration_add_cv_metadata.sql
```

### Hoặc sử dụng pgAdmin/DBeaver

Copy nội dung file `migration_add_cv_metadata.sql` và execute trong database client.

### Schema Changes

```sql
ALTER TABLE "CV" 
ADD COLUMN IF NOT EXISTS "File_name" VARCHAR(255);

ALTER TABLE "CV" 
ADD COLUMN IF NOT EXISTS "S3_key" VARCHAR(500);
```

---

## Testing

### 1. Test Upload CV

```bash
curl -X POST http://localhost:8080/api/candidates/cvs/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/cv.pdf" \
  -F "title=My CV"
```

### 2. Test Get Recent CVs

```bash
curl -X GET http://localhost:8080/api/candidates/cvs/recent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test Get My Applications

```bash
curl -X GET "http://localhost:8080/api/candidates/applications/my-applications?page=0&size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Swagger Documentation

Sau khi chạy ứng dụng, truy cập Swagger UI để test API:

```
http://localhost:8080/swagger-ui.html
```

Tìm các endpoints:
- **08.1 Application Candidate** - APIs for applying jobs
- **09.1 CV Management** - APIs for managing CVs

---

## Lưu Ý Quan Trọng

### 1. Giới Hạn CV
- Mỗi user chỉ được giữ tối đa **3 CV**
- Khi upload CV thứ 4, CV cũ nhất sẽ tự động bị xóa
- CV cũ sẽ bị xóa **cả từ AWS S3 và database**

### 2. Pre-signed URLs
- File URLs được generate bằng pre-signed URLs
- URLs có hiệu lực trong **1 giờ**
- Sau 1 giờ cần gọi lại API để lấy URL mới

### 3. File Types
- Hỗ trợ các định dạng: PDF, DOC, DOCX
- Kích thước file tối đa phụ thuộc vào cấu hình Spring Boot

### 4. Security
- Tất cả endpoints yêu cầu JWT authentication
- User chỉ có thể xem/quản lý CV của chính mình

---

## Troubleshooting

### Lỗi "User profile not found"
- Đảm bảo user đã có profile trong bảng `candidate_profiles`
- Profile phải được tạo trước khi upload CV

### Lỗi AWS S3 Connection
- Kiểm tra AWS credentials (Access Key & Secret Key)
- Kiểm tra region có đúng không
- Kiểm tra bucket name có tồn tại không
- Kiểm tra IAM permissions

### Lỗi Database
- Chạy migration script để thêm cột mới
- Kiểm tra kết nối database
- Kiểm tra quyền của user database

---

## Technical Stack

- **Backend**: Spring Boot 3.2.1
- **Database**: PostgreSQL
- **Cloud Storage**: AWS S3
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI

---

## Files Created/Modified

### New Files
1. `S3Config.java` - AWS S3 configuration
2. `S3Service.java` - S3 service interface
3. `S3ServiceImpl.java` - S3 service implementation
4. `CVController.java` - CV management controller
5. `CVResponse.java` - DTO for CV response
6. `migration_add_cv_metadata.sql` - Database migration script

### Modified Files
1. `CV.java` - Added fileName and s3Key fields
2. `CVRepository.java` - Added queries for recent CVs
3. `CVService.java` - Added methods for CV management
4. `CVServiceImpl.java` - Implemented CV management logic

---

## Contact

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team phát triển.
