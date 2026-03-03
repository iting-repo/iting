# ITing Job Portal Backend — Tổng quan dự án

## 1. Giới thiệu
ITing Job Portal Backend là hệ thống backend cho nền tảng tuyển dụng/việc làm (Job Portal) được xây dựng trên **Spring Boot**. Dự án tổ chức theo hướng **modular monolith**: tách theo domain/module (auth, job, company, user profile, admin, messaging, …) nhưng vẫn chạy dưới một service.

Mục tiêu chính:
- Cung cấp REST API cho ứng viên và nhà tuyển dụng.
- Xác thực bằng **JWT Access Token** + **Refresh Token** (token rotation).
- Phân quyền theo **RBAC** (Role-Based Access Control) ở mức **permission code**.
- Quản lý việc làm, hồ sơ ứng viên, hồ sơ công ty, ứng tuyển, và các tính năng mở rộng (messaging/social/notification).
- Hỗ trợ deploy lên **Render** + **Aiven PostgreSQL** bằng Docker.

## 2. Công nghệ sử dụng
- **Java**: 17
- **Spring Boot**: (thực tế dự án có cả Gradle & Maven, Dockerfile đang build bằng Maven)
- **Spring Web (MVC)**: REST API
- **Spring Data JPA / Hibernate**: ORM
- **Spring Security**: authentication/authorization
- **JWT**: `io.jsonwebtoken:jjwt-*`
- **Swagger/OpenAPI**: `springdoc-openapi-starter-webmvc-ui`
- **Database**: PostgreSQL (production), H2 (test - theo Gradle)
- **Cloudinary**: (có cấu hình trong `cloud/CloudinaryConfig.java`)

## 3. Entry point & cấu trúc chạy ứng dụng
- Entry point: `src/main/java/com/iting/jobportal/ItingJobPortalApplication.java`
  - `@SpringBootApplication`
  - `@EnableScheduling`

## 4. Kiến trúc tổng quan (high-level)
Luồng xử lý điển hình:
- **Controller** nhận request (REST)
- **Service** xử lý nghiệp vụ
- **Repository** thao tác dữ liệu (JPA)
- **Security Filter** kiểm tra JWT, nạp thông tin user/authority vào SecurityContext

Tính năng bảo mật:
- **JWT Access Token**: dùng cho request API.
- **Refresh Token**: lưu DB để phát hành lại access token khi hết hạn.
- **RBAC theo permission**:
  - Các endpoint được bảo vệ bằng `hasAuthority("PERMISSION_CODE")` trong `SecurityConfig`.

## 5. Cấu trúc thư mục chính
### 5.1 Root
- `src/main/java`: mã nguồn Java
- `src/main/resources`: cấu hình Spring (`application.properties`, `application-prod.properties`), SQL init
- `scraper/`: tool Python cào dữ liệu việc làm (ITviec)
- `cloud/`: cấu hình Cloudinary
- `upload/`, `file/`: liên quan upload/file (tùy cách bạn đang triển khai)
- `Dockerfile`, `render.yaml`: cấu hình deploy Render
- Các file hướng dẫn:
  - `API_TEST_GUIDE.md`
  - `RBAC_API_TESTING_GUIDE.md`
  - `JWT_REFRESH_TOKEN_GUIDE.md`
  - `DEPLOYMENT_GUIDE.md`

### 5.2 Các package/module trong `com.iting.jobportal`
(được tách theo domain)
- `auth/`: đăng ký/đăng nhập, JWT, refresh token, entity/repository liên quan account
- `admin/`: chức năng quản trị (thường gồm permission, quản lý hệ thống)
- `core/`: domain/repository/service cốt lõi (ví dụ RBAC RoleService/RoleRepository)
- `job/`: job posting, tìm kiếm, featured/latest/hot, CRUD
- `company/`: quản lý công ty (thông tin cơ bản, giấy tờ…)
- `user/`, `userprofile/`: thông tin ứng viên và profile (skills, education, experience, CV…)
- `messaging/`: nhắn tin
- `social/`: tính năng xã hội
- `notification/`: thông báo
- `config/`, `common/`, `security/`, `webinfo/`: các phần hỗ trợ

## 6. Authentication & Authorization
### 6.1 Auth APIs
Các endpoint chính (tham khảo `API_TEST_GUIDE.md`):
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/change-password`
- `POST /api/auth/refresh` (refresh access token)

### 6.2 JWT Access Token
- Util: `com.iting.jobportal.auth.security.JwtTokenUtil`
- Cấu hình trong `application.properties`:
  - `jwt.secret`
  - `jwt.expiration`

### 6.3 Refresh Token
- Controller: `com.iting.jobportal.auth.controller.RefreshTokenController`
- Service: `com.iting.jobportal.auth.service.impl.RefreshTokenServiceImpl`
- Tính năng chính:
  - Token rotation (refresh xong sẽ tạo refresh token mới)
  - Limit số token active trên mỗi user (`jwt.refresh.max-tokens-per-user`)
  - Revoke / cleanup token hết hạn

Chi tiết xem: `JWT_REFRESH_TOKEN_GUIDE.md`.

### 6.4 RBAC theo permission
- Security config: `com.iting.jobportal.auth.security.SecurityConfig`
- Cơ chế:
  - Các route được giới hạn theo `hasAuthority("...")`
  - Ví dụ:
    - `POST /api/jobs` cần `JOB_CREATE`
    - `PUT /api/jobs/**` cần `JOB_UPDATE`
    - `POST /api/file/upload` cần `FILE_UPLOAD`

Chi tiết test RBAC xem: `RBAC_API_TESTING_GUIDE.md`.

## 7. Database & data initialization
### 7.1 Local/dev
`src/main/resources/application.properties` đang cấu hình:
- `spring.jpa.hibernate.ddl-auto=create-drop`
- `spring.sql.init.mode=always`
- `spring.sql.init.data-locations=classpath:rbc-init.sql`

Điều này nghĩa là mỗi lần chạy local có thể **tạo lại schema và nạp dữ liệu RBAC** (phù hợp cho dev/test nhanh, không phù hợp production).

### 7.2 Production
`src/main/resources/application-prod.properties`:
- `spring.jpa.hibernate.ddl-auto=update`
- `spring.sql.init.mode=never`
- Datasource lấy từ env:
  - `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`

## 8. Chạy dự án local
Lưu ý: repo đang có **cả `build.gradle` và `pom.xml`**.
- Dockerfile deploy đang dùng **Maven** (`mvn clean package`).
- Tài liệu test RBAC có ví dụ dùng **Gradle** (`./gradlew bootRun`).

Bạn nên chọn 1 cách làm “chuẩn” cho team (khuyến nghị theo Dockerfile là Maven).

### 8.1 Chạy bằng Maven
- Build:
  - `mvn clean package`
- Run:
  - `mvn spring-boot:run`

### 8.2 Chạy bằng Gradle
- Run:
  - `./gradlew bootRun`

### 8.3 Swagger
- Swagger UI:
  - `http://localhost:8080/swagger-ui.html`
- OpenAPI docs:
  - `http://localhost:8080/api-docs`

## 9. Deploy (Render + Aiven)
- `render.yaml`: khai báo service Render (runtime Docker)
- `Dockerfile`: build bằng Maven, chạy với profile `prod`

Các biến môi trường quan trọng (Render Dashboard):
- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `SPRING_PROFILES_ACTIVE=prod`

Xem hướng dẫn đầy đủ: `DEPLOYMENT_GUIDE.md`.

## 10. Scraper (Python)
Thư mục `scraper/` chứa tool cào dữ liệu ITviec và insert/extract SQL.
- File chính:
  - `itviec_scraper.py`
  - `itviec_data_generator.py`
- Cấu hình: `.env`
- Cài đặt: `pip install -r requirements.txt`

Chi tiết xem: `scraper/README.md`.

## 11. Tài liệu/test nhanh
- Test tổng quan API: `API_TEST_GUIDE.md`
- Test RBAC: `RBAC_API_TESTING_GUIDE.md`
- JWT refresh token: `JWT_REFRESH_TOKEN_GUIDE.md`
- Deploy: `DEPLOYMENT_GUIDE.md`

---

## 12. Gợi ý chuẩn hoá cho team (khuyến nghị)
- Thống nhất **một** build tool chính:
  - Nếu deploy theo Dockerfile hiện tại: ưu tiên Maven.
  - Nếu muốn Gradle: cần đồng bộ lại Dockerfile/workflow build.
- Không commit secret thật trong `application.properties` (nên chuyển sang env/local override).

