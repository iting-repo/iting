# 📘 HƯỚNG DẪN TEST API - ITING JOB PORTAL

## 🔐 Base URL
```
http://localhost:8080
```

## 📋 Swagger UI
```
http://localhost:8080/swagger-ui.html
```

---

## 1️⃣ AUTHENTICATION APIs

### 1.1 Đăng ký tài khoản mới
```bash
POST /api/auth/register
Content-Type: application/json

# Đăng ký ứng viên
{
  "email": "newuser@gmail.com",
  "password": "123456",
  "role": "CANDIDATE"
}

# Đăng ký nhà tuyển dụng
{
  "email": "newcompany@gmail.com",
  "password": "123456",
  "role": "EMPLOYER"
}
```

### 1.2 Đăng nhập
```bash
POST /api/auth/login
Content-Type: application/json

# Đăng nhập ứng viên
{
  "email": "ungvien1@gmail.com",
  "password": "123456"
}

# Đăng nhập nhà tuyển dụng
{
  "email": "hr@fpt.com",
  "password": "123456"
}

# Đăng nhập admin
{
  "email": "admin@iting.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "userId": 1,
  "email": "ungvien1@gmail.com",
  "role": "CANDIDATE",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### 1.3 Đổi mật khẩu
```bash
POST /api/auth/change-password
Content-Type: application/json
Authorization: Bearer <token>

{
  "oldPassword": "123456",
  "newPassword": "newpass123"
}
```

---

## 2️⃣ USER PROFILE APIs

### 2.1 Xem profile
```bash
GET /api/user/profile
Authorization: Bearer <token>
```

### 2.2 Cập nhật thông tin cơ bản
```bash
PUT /api/user/profile/basic
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "Nguyen",
  "lastName": "Van A",
  "birthDate": "1999-01-15",
  "sex": "MALE"
}
```

### 2.3 Cập nhật avatar
```bash
PUT /api/user/profile/avatar
Content-Type: application/json
Authorization: Bearer <token>

{
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

### 2.4 Xóa avatar
```bash
DELETE /api/user/profile/avatar
Authorization: Bearer <token>
```

### 2.5 Cập nhật mô tả
```bash
PUT /api/user/profile/description
Content-Type: application/json
Authorization: Bearer <token>

{
  "description": "Tôi là lập trình viên Java với 3 năm kinh nghiệm, đam mê công nghệ và luôn tìm kiếm thử thách mới."
}
```

### 2.6 Cập nhật địa chỉ
```bash
PUT /api/user/profile/address
Content-Type: application/json
Authorization: Bearer <token>

{
  "address": "Quận 1, TP. Hồ Chí Minh"
}
```

### 2.7 Cập nhật ngày sinh & giới tính
```bash
PUT /api/user/profile/birth-gender
Content-Type: application/json
Authorization: Bearer <token>

{
  "birthDate": "1999-05-20",
  "gender": "MALE"
}
```

---

## 3️⃣ USER PROFILE - CONTACT INFO

### 3.1 Cập nhật thông tin liên hệ
```bash
PUT /api/user/profile/contact
Content-Type: application/json
Authorization: Bearer <token>

{
  "phone": "0901234567",
  "email": "contact@gmail.com"
}
```

---

## 4️⃣ USER PROFILE - SOCIAL LINKS

### 4.1 Xem danh sách social links
```bash
GET /api/user/profile/social
Authorization: Bearer <token>
```

### 4.2 Thêm social link
```bash
POST /api/user/profile/social
Content-Type: application/json
Authorization: Bearer <token>

{
  "platform": "LinkedIn",
  "url": "https://linkedin.com/in/username"
}

# Các platform phổ biến: LinkedIn, GitHub, Facebook, Twitter, Dribbble, Medium
```

### 4.3 Cập nhật social link
```bash
PUT /api/user/profile/social/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "platform": "GitHub",
  "url": "https://github.com/newusername"
}
```

### 4.4 Xóa social link
```bash
DELETE /api/user/profile/social/{id}
Authorization: Bearer <token>
```

---

## 5️⃣ USER PROFILE - EDUCATION

### 5.1 Xem danh sách học vấn
```bash
GET /api/user/profile/educations
Authorization: Bearer <token>
```

### 5.2 Thêm học vấn
```bash
POST /api/user/profile/education
Content-Type: application/json
Authorization: Bearer <token>

{
  "school": "Đại học Bách Khoa TP.HCM",
  "degree": "Cử nhân Khoa học Máy tính",
  "startDate": "2017-09-01",
  "endDate": "2021-06-30",
  "description": "Tốt nghiệp loại Giỏi, GPA 3.5/4.0"
}
```

### 5.3 Cập nhật học vấn
```bash
PUT /api/user/profile/education/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "school": "Đại học RMIT",
  "degree": "Thạc sĩ IT",
  "startDate": "2022-01-01",
  "endDate": null,
  "description": "Đang theo học"
}
```

### 5.4 Xóa học vấn
```bash
DELETE /api/user/profile/education/{id}
Authorization: Bearer <token>
```

---

## 6️⃣ USER PROFILE - SKILLS

### 6.1 Xem danh sách kỹ năng
```bash
GET /api/user/profile/skills
Authorization: Bearer <token>
```

### 6.2 Thêm kỹ năng
```bash
POST /api/user/profile/skills
Content-Type: application/json
Authorization: Bearer <token>

{
  "skill": "Java",
  "level": "Advanced"
}

# Level: Beginner, Intermediate, Advanced, Expert
```

### 6.3 Cập nhật kỹ năng
```bash
PUT /api/user/profile/skills/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "skill": "Spring Boot",
  "level": "Expert"
}
```

### 6.4 Xóa kỹ năng
```bash
DELETE /api/user/profile/skills/{id}
Authorization: Bearer <token>
```

---

## 7️⃣ USER PROFILE - CERTIFICATES

### 7.1 Thêm chứng chỉ
```bash
POST /api/user/profile/certificates
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "AWS Solutions Architect Associate",
  "organization": "Amazon Web Services",
  "date": "2024-01-15"
}
```

### 7.2 Cập nhật chứng chỉ
```bash
PUT /api/user/profile/certificates/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "AWS Solutions Architect Professional",
  "organization": "Amazon Web Services",
  "date": "2024-06-20"
}
```

### 7.3 Xóa chứng chỉ
```bash
DELETE /api/user/profile/certificates/{id}
Authorization: Bearer <token>
```

---

## 8️⃣ USER PROFILE - EXPERIENCE

### 8.1 Thêm kinh nghiệm
```bash
POST /api/user/profile/experience
Content-Type: application/json
Authorization: Bearer <token>

{
  "company": "FPT Software",
  "role": "Java Developer",
  "startDate": "2021-07-01",
  "endDate": "2023-06-30",
  "description": "Phát triển REST API cho hệ thống e-commerce, sử dụng Spring Boot, MySQL, Redis"
}

# endDate = null nếu đang làm việc
```

### 8.2 Cập nhật kinh nghiệm
```bash
PUT /api/user/profile/experience/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "company": "VNG Corporation",
  "role": "Senior Backend Developer",
  "startDate": "2023-07-01",
  "endDate": null,
  "description": "Lead team 5 người phát triển Zalo Mini App"
}
```

### 8.3 Xóa kinh nghiệm
```bash
DELETE /api/user/profile/experience/{id}
Authorization: Bearer <token>
```

---

## 9️⃣ USER PROFILE - PORTFOLIO

### 9.1 Xem portfolio
```bash
GET /api/user/profile/portfolio
Authorization: Bearer <token>
```

### 9.2 Thêm portfolio link
```bash
POST /api/user/profile/portfolio/link
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://github.com/username/project",
  "description": "E-commerce REST API với Spring Boot"
}
```

### 9.3 Upload portfolio file
```bash
POST /api/user/profile/portfolio/file
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <file>
```

### 9.4 Xóa portfolio
```bash
DELETE /api/user/profile/portfolio/{id}
Authorization: Bearer <token>
```

---

## 🔟 USER PROFILE - CV

### 10.1 Xem danh sách CV
```bash
GET /api/user/profile/cv
Authorization: Bearer <token>
```

### 10.2 Upload CV
```bash
POST /api/user/profile/cv
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <file.pdf>
```

### 10.3 Thay thế CV
```bash
PUT /api/user/profile/cv/{id}
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <newfile.pdf>
```

### 10.4 Xóa CV
```bash
DELETE /api/user/profile/cv/{id}
Authorization: Bearer <token>
```

### 10.5 Phân tích CV bằng AI
```bash
POST /api/user/profile/cv/{id}/analyze
Authorization: Bearer <token>
```

---

## 1️⃣1️⃣ USER PROFILE - CAREER OBJECTIVE

### 11.1 Cập nhật mục tiêu nghề nghiệp
```bash
PUT /api/user/profile/career
Content-Type: application/json
Authorization: Bearer <token>

{
  "objective": "Trở thành Senior Developer trong 2 năm tới, chuyên về microservices và cloud computing"
}
```

---

## 1️⃣2️⃣ COMPANY APIs

### 12.1 Xem thông tin công ty
```bash
GET /api/companies/{id}

# Ví dụ: Xem FPT Software (id=4)
GET /api/companies/4
```

### 12.2 Cập nhật thông tin cơ bản
```bash
PUT /api/companies/{id}/basic-info
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "FPT Software",
  "website": "https://fpt-software.com",
  "address": "Khu Công Nghệ Cao, Quận 9, TP.HCM",
  "description": "Công ty phần mềm hàng đầu Việt Nam",
  "companyEmail": "hr@fpt.com",
  "industry": "IT Software",
  "companySize": "5000+",
  "phone": "0281234567"
}
```

### 12.3 Cập nhật thông tin đại diện
```bash
PUT /api/companies/{id}/representative
Content-Type: application/json
Authorization: Bearer <token>

{
  "representativeName": "Nguyễn Văn HR",
  "representativeGender": "MALE",
  "representativePhone": "0901234567",
  "accountEmail": "hr.manager@fpt.com"
}
```

### 12.4 Upload giấy phép kinh doanh
```bash
POST /api/companies/{id}/business-license
Content-Type: application/json
Authorization: Bearer <token>

{
  "taxCode": "0101234567",
  "businessLicenseFileUrl": "https://storage.example.com/license.pdf"
}
```

### 12.5 Upload giấy ủy quyền
```bash
POST /api/companies/{id}/consent-document
Content-Type: application/json
Authorization: Bearer <token>

{
  "consentDocumentFileUrl": "https://storage.example.com/consent.pdf"
}
```

### 12.6 Xác thực số điện thoại
```bash
POST /api/companies/{id}/verify-phone
Content-Type: application/json
Authorization: Bearer <token>

{
  "phone": "0901234567",
  "otp": "123456"
}
```

### 12.7 Xác thực giấy phép
```bash
POST /api/companies/{id}/verify-license
Content-Type: application/json
Authorization: Bearer <token>

{
  "approved": true,
  "note": "Giấy phép hợp lệ"
}
```

---

## 1️⃣3️⃣ JOB APIs (Quản lý việc làm)

### 13.1 Tìm kiếm và lọc việc làm (Public)
```bash
GET /api/jobs/search?keyword=java&location=Ho Chi Minh&jobType=FULL_TIME&experienceLevel=JUNIOR&minSalary=15000000&sortBy=salary&sortOrder=desc&page=0&size=10

# Các tham số:
# - keyword: Từ khóa tìm kiếm (position, description)
# - location: Địa điểm
# - jobType: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE, FREELANCE
# - experienceLevel: FRESHER, JUNIOR, MIDDLE, SENIOR, LEAD, MANAGER
# - minSalary, maxSalary: Khoảng lương
# - companyId: Lọc theo công ty
# - techRequired: Lọc theo công nghệ
# - sortBy: createdAt, salary
# - sortOrder: asc, desc
```

### 13.2 Xem chi tiết việc làm (tăng view count)
```bash
GET /api/jobs/{id}

# Ví dụ:
GET /api/jobs/1
```

### 13.3 Lấy việc làm mới nhất
```bash
GET /api/jobs/latest?limit=10
```

### 13.4 Lấy việc làm hot
```bash
GET /api/jobs/hot?limit=10
```

### 13.5 Tạo việc làm mới (Employer only)
```bash
POST /api/jobs
Content-Type: application/json
Authorization: Bearer <employer_token>

{
  "position": "Senior Java Developer",
  "description": "Phát triển và bảo trì các ứng dụng Java/Spring Boot.",
  "requirements": "- 3+ năm kinh nghiệm Java\n- Thành thạo Spring Boot\n- Tiếng Anh giao tiếp",
  "location": "TP. Hồ Chí Minh",
  "techRequired": "Java, Spring Boot, MySQL, Redis, Docker",
  "jobType": "FULL_TIME",
  "experienceLevel": "SENIOR",
  "maxAccept": 5,
  "minSalary": 25000000,
  "maxSalary": 45000000,
  "dueDate": "2025-03-01"
}
```

### 13.6 Cập nhật việc làm (Employer only)
```bash
PUT /api/jobs/{id}
Content-Type: application/json
Authorization: Bearer <employer_token>

{
  "position": "Senior Java Developer (Updated)",
  "description": "Mô tả mới...",
  "status": "ACTIVE",
  "maxSalary": 50000000
}
```

### 13.7 Xóa việc làm (Employer only)
```bash
DELETE /api/jobs/{id}
Authorization: Bearer <employer_token>
```

### 13.8 Gia hạn việc làm (Employer only)
```bash
POST /api/jobs/{id}/extend?days=30
Authorization: Bearer <employer_token>
```

### 13.9 Đóng việc làm (Employer only)
```bash
POST /api/jobs/{id}/close
Authorization: Bearer <employer_token>
```

### 13.10 Xem danh sách việc làm của tôi (Employer)
```bash
GET /api/jobs/my-jobs?page=0&size=10
Authorization: Bearer <employer_token>
```

---

## 1️⃣4️⃣ APPLICATION APIs (Ứng tuyển)

### ===== CHO ỨNG VIÊN =====

### 14.1 Nộp đơn ứng tuyển
```bash
POST /api/applications/apply
Content-Type: application/json
Authorization: Bearer <candidate_token>

{
  "jobId": 1,
  "applicantName": "Nguyen Van A",
  "applicantEmail": "nguyenvana@gmail.com",
  "applicantPhone": "0901234567",
  "cvUrl": "/uploads/cv/my_cv.pdf",
  "coverLetter": "Kính gửi nhà tuyển dụng,\nTôi là Nguyen Van A, xin ứng tuyển vị trí Java Developer..."
}

# Hoặc chọn CV đã upload:
{
  "jobId": 1,
  "applicantName": "Nguyen Van A",
  "applicantEmail": "nguyenvana@gmail.com",
  "cvId": 1,
  "coverLetter": "Thư xin việc..."
}
```

### 14.2 Rút đơn ứng tuyển
```bash
POST /api/applications/{id}/withdraw
Authorization: Bearer <candidate_token>
```

### 14.3 Xem danh sách đơn đã nộp
```bash
GET /api/applications/my-applications?page=0&size=10
Authorization: Bearer <candidate_token>
```

### 14.4 Kiểm tra đã ứng tuyển job chưa
```bash
GET /api/applications/check/{jobId}
Authorization: Bearer <candidate_token>

# Response:
{
  "hasApplied": true
}
```

### ===== CHO NHÀ TUYỂN DỤNG =====

### 14.5 Xem danh sách đơn ứng tuyển của một job
```bash
GET /api/applications/job/{jobId}?page=0&size=10
Authorization: Bearer <employer_token>
```

### 14.6 Xem tất cả đơn ứng tuyển
```bash
GET /api/applications/employer?page=0&size=10
Authorization: Bearer <employer_token>
```

### 14.7 Tìm kiếm và lọc đơn ứng tuyển
```bash
GET /api/applications/employer/search?jobId=1&status=PENDING&keyword=nguyen&page=0&size=10
Authorization: Bearer <employer_token>

# Các status: PENDING, VIEWED, SHORTLISTED, INTERVIEWING, OFFERED, ACCEPTED, REJECTED, WITHDRAWN
```

### 14.8 Xem chi tiết đơn ứng tuyển (đánh dấu đã xem)
```bash
GET /api/applications/{id}
Authorization: Bearer <employer_token>
```

### 14.9 Cập nhật trạng thái đơn ứng tuyển
```bash
PUT /api/applications/{id}/status
Content-Type: application/json
Authorization: Bearer <employer_token>

{
  "status": "SHORTLISTED",
  "note": "Ứng viên có profile tốt, cần xếp lịch phỏng vấn"
}
```

### 14.10 Chấp nhận ứng viên
```bash
POST /api/applications/{id}/accept?note=Chuc mung ban da duoc nhan viec!
Authorization: Bearer <employer_token>
```

### 14.11 Từ chối ứng viên
```bash
POST /api/applications/{id}/reject?note=Xin loi, profile chua phu hop
Authorization: Bearer <employer_token>
```

### 14.12 Đưa vào danh sách ngắn (Shortlist)
```bash
POST /api/applications/{id}/shortlist
Authorization: Bearer <employer_token>
```

### 14.13 Thống kê đơn ứng tuyển (Employer)
```bash
GET /api/applications/stats/employer
Authorization: Bearer <employer_token>

# Response:
{
  "total": 50,
  "pending": 20,
  "viewed": 10,
  "shortlisted": 8,
  "interviewing": 5,
  "offered": 3,
  "accepted": 2,
  "rejected": 2,
  "withdrawn": 0
}
```

### 14.14 Thống kê đơn ứng tuyển của một job
```bash
GET /api/applications/stats/job/{jobId}
Authorization: Bearer <employer_token>
```

---

## 📝 TEST ACCOUNTS

| Email | Password | Role | ID |
|-------|----------|------|-----|
| ungvien1@gmail.com | 123456 | CANDIDATE | 1 |
| ungvien2@gmail.com | 123456 | CANDIDATE | 2 |
| ungvien3@gmail.com | 123456 | CANDIDATE | 3 |
| hr@fpt.com | 123456 | EMPLOYER | 4 |
| hr@vng.com | 123456 | EMPLOYER | 5 |
| hr@vingroup.com | 123456 | EMPLOYER | 6 |
| admin@iting.com | 123456 | ADMIN | 7 |

---

## 🧪 QUICK TEST với cURL (PowerShell)

### Login và lấy token:
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"ungvien1@gmail.com","password":"123456"}'
$token = $response.token
Write-Host "Token: $token"
```

### Sử dụng token để gọi API:
```powershell
# Xem skills
Invoke-RestMethod -Uri "http://localhost:8080/api/user/profile/skills" -Method GET -Headers @{Authorization="Bearer $token"}

# Thêm skill mới
Invoke-RestMethod -Uri "http://localhost:8080/api/user/profile/skills" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"skill":"Python","level":"Intermediate"}'
```

---

## ⚠️ LƯU Ý

1. **Authorization Header**: Hầu hết API cần token JWT
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
   ```

2. **Content-Type**: Luôn set cho POST/PUT requests
   ```
   Content-Type: application/json
   ```

3. **Date Format**: Sử dụng format `YYYY-MM-DD`
   ```json
   "birthDate": "1999-01-15"
   ```

4. **Gender/Sex values**: `MALE`, `FEMALE`, `OTHER`

5. **Role values**: `CANDIDATE`, `EMPLOYER`, `ADMIN`

6. **Skill levels**: `Beginner`, `Intermediate`, `Advanced`, `Expert`

